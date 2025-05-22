<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// Adjust path to point to autoload.php in public_html
require dirname(__DIR__) . '/vendor/autoload.php';
$config = require __DIR__ . '/config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Rate Limiting (1 email per minute)
if (isset($_SESSION['last_email_time']) && (time() - $_SESSION['last_email_time'] < 60)) {
    die("Please wait before sending another message.");
}
$_SESSION['last_email_time'] = time();

// Input validation
$name = filter_var(trim($_POST["name"]), FILTER_SANITIZE_STRING);
$email = filter_var(trim($_POST["email"]), FILTER_VALIDATE_EMAIL);
$subject = filter_var(trim($_POST["subject"]), FILTER_SANITIZE_STRING);
$message = filter_var(trim($_POST["message"]), FILTER_SANITIZE_STRING);

if (!$email) {
    die("Invalid email address.");
}

// Prevent header injection
if (preg_match("/[\r\n]/", $name) || preg_match("/[\r\n]/", $email)) {
    die("Invalid input detected.");
}

$mail = new PHPMailer(true);

try {
    // SMTP settings
    $mail->isSMTP();
    $mail->SMTPAuth = true;
    $mail->Host = 'mail.heraishealthcare.com';  // Updated outgoing server
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Ensure secure connection
    $mail->Port = 465; // Updated SMTP port
    
    // Enable verbose debug output
    $mail->SMTPDebug = SMTP::DEBUG_CONNECTION; // Even more detailed debugging
    $mail->Debugoutput = function($str, $level) {
        error_log("DEBUG: $str");
    };
    
    // More permissive SSL settings for troubleshooting
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];
    
    $mail->Username = $config['SMTP_USER'];
    $mail->Password = $config['SMTP_PASS'];

    // Email settings
    $mail->setFrom('info@heraisprojects.com', $name);
    $mail->addAddress("info@heraisprojects.com", "Raja");
    $mail->addReplyTo($email, $name);

    $mail->Subject = htmlspecialchars(strip_tags($subject));
    $mail->Body = "
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>
    <p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
    <p><strong>Subject:</strong> " . htmlspecialchars($subject) . "</p>
    <p><strong>Message:</strong><br>" . nl2br(htmlspecialchars($message)) . "</p>";
    $mail->isHTML(true);

    if ($mail->send()) {
        header("Location: sent.html");
        exit();
    } else {
        throw new Exception("Error sending message.");
    }

} catch (Exception $e) {
    error_log("Mailer Error: " . $mail->ErrorInfo);
    die("Error sending message. Please try again later.");
}
?>
