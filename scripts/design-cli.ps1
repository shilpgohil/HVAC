param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsList
)
$cliPath = Join-Path $PSScriptRoot "..\.agents\skills\ui-ux-design-pro\cli\index.ts"
& npx -y tsx $cliPath @ArgsList
