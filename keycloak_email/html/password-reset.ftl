<html>
<body>
${kcSanitize(msg("passwordResetBodyHtml",link, linkExpiration, user.firstName, linkExpirationFormatter(linkExpiration)))?no_esc}
</body>
</html>