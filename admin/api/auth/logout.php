<?php
require_once __DIR__ . '/../common/bootstrap.php';
requirePost();

$_SESSION = [];
session_destroy();
respond(200, ['status' => 'success']);
