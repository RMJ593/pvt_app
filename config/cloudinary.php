<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | An HTTP or HTTPS URL to notify your application (a webhook) when the process of the upload is complete.
    |
    */

    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),

    'api_key' => env('CLOUDINARY_API_KEY'),

    'api_secret' => env('CLOUDINARY_API_SECRET'),

    'url' => env('CLOUDINARY_URL'),

    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),

    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),

    'secure' => env('CLOUDINARY_SECURE', true),

    'secure_distribution' => env('CLOUDINARY_SECURE_DISTRIBUTION'),

    'secure_url' => env('CLOUDINARY_SECURE_URL', true),

    'cname' => env('CLOUDINARY_CNAME'),

    'private_cdn' => env('CLOUDINARY_PRIVATE_CDN', false),

];