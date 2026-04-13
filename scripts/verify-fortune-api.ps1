param(
  [Parameter(Mandatory = $true)]
  [string]$Endpoint,

  [string]$AccessToken = "",

  [string]$Concern = "career consultation",
  [string]$Mode = "総合",
  [string]$Depth = "ライト",
  [string]$SelfBirthDate = "1995-05-20",
  [ValidateSet("default", "sales_v2")]
  [string]$PromptProfile = "sales_v2",
  [int]$Repeat = 1,
  [switch]$EnableDebugMarker,
  [switch]$BypassOpenAI
)

$repeatCount = [Math]::Max(1, $Repeat)

Write-Host "[verify-fortune-api] endpoint = $Endpoint"
Write-Host "[verify-fortune-api] repeat   = $repeatCount"
Write-Host "[verify-fortune-api] bypass   = $($BypassOpenAI.IsPresent)"
Write-Host "[verify-fortune-api] marker   = $($EnableDebugMarker.IsPresent)"
Write-Host "[verify-fortune-api] token    = $([string]::IsNullOrWhiteSpace($AccessToken) -eq $false)"
Write-Host "[verify-fortune-api] profile  = $PromptProfile"

for ($i = 1; $i -le $repeatCount; $i++) {
  $debugRequestId = "manual-$i-" + [guid]::NewGuid().ToString("N")
  $headers = @{
    "Content-Type"       = "application/json"
    "x-debug-request-id" = $debugRequestId
  }

  if (-not [string]::IsNullOrWhiteSpace($AccessToken)) {
    $headers["Authorization"] = "Bearer $AccessToken"
  }

  if ($EnableDebugMarker) {
    $headers["x-fortune-debug"] = "1"
  }

  if ($BypassOpenAI) {
    $headers["x-openai-bypass"] = "1"
  }

  $headers["x-openai-prompt-profile"] = $PromptProfile

  $body = @{
    mode          = $Mode
    depth         = $Depth
    concern       = "$Concern #$i"
    selfBirthDate = $SelfBirthDate
    history       = @()
  } | ConvertTo-Json -Depth 5

  try {
    $response = Invoke-WebRequest -Method Post -Uri $Endpoint -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    $preview = if ($json.response) { ($json.response.ToString().Split("`n")[0]) } else { "<no-response>" }

    Write-Host ""
    Write-Host "=== Call $i ==="
    Write-Host "status: $($response.StatusCode)"
    Write-Host "debug.requestId: $($json.debug.requestId)"
    Write-Host "debug.source: $($json.debug.source)"
    Write-Host "debug.promptProfile: $($json.debug.promptProfile)"
    Write-Host "header.x-fortune-response-source: $($response.Headers['x-fortune-response-source'])"
    Write-Host "preview.firstLine: $preview"
  }
  catch {
    Write-Error $_
    if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream()) {
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $reader.BaseStream.Position = 0
      $reader.DiscardBufferedData()
      $errorBody = $reader.ReadToEnd()
      Write-Host "error.body: $errorBody"
    }
    exit 1
  }
}
