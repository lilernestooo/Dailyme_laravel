<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>DailyMe</title>
    @vite(['resources/js/app.jsx'])
</head>
<body style="margin:0">
    <div id="app"></div>
</body>
</html>