<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class DiagnosticController extends Controller
{
    /**
     * Run diagnostics to find the issue
     * Visit: https://your-domain.com/api/diagnose
     */
    public function diagnose()
    {
        $results = [];
        
        // Test 1: Database Connection
        try {
            DB::connection()->getPdo();
            $results['database'] = [
                'status' => 'OK',
                'message' => 'Database connected successfully'
            ];
        } catch (\Exception $e) {
            $results['database'] = [
                'status' => 'FAILED',
                'message' => $e->getMessage()
            ];
        }
        
        // Test 2: Categories Table Exists
        try {
            $exists = Schema::hasTable('categories');
            $results['table_exists'] = [
                'status' => $exists ? 'OK' : 'FAILED',
                'message' => $exists ? 'Categories table exists' : 'Categories table NOT found'
            ];
        } catch (\Exception $e) {
            $results['table_exists'] = [
                'status' => 'FAILED',
                'message' => $e->getMessage()
            ];
        }
        
        // Test 3: Table Columns
        try {
            $requiredColumns = [
                'id', 'name', 'small_heading', 'location', 'image', 
                'is_active', 'is_royalty', 'is_special_selection'
            ];
            
            $existingColumns = Schema::getColumnListing('categories');
            $missingColumns = array_diff($requiredColumns, $existingColumns);
            
            $results['table_columns'] = [
                'status' => empty($missingColumns) ? 'OK' : 'FAILED',
                'message' => empty($missingColumns) 
                    ? 'All required columns exist' 
                    : 'Missing columns: ' . implode(', ', $missingColumns),
                'existing_columns' => $existingColumns,
                'required_columns' => $requiredColumns,
                'missing_columns' => array_values($missingColumns)
            ];
        } catch (\Exception $e) {
            $results['table_columns'] = [
                'status' => 'FAILED',
                'message' => $e->getMessage()
            ];
        }
        
        // Test 4: Cloudinary Configuration
        $cloudName = config('cloudinary.cloud_name');
        $apiKey = config('cloudinary.api_key');
        $apiSecret = config('cloudinary.api_secret');
        
        $cloudinaryConfigured = !empty($cloudName) && !empty($apiKey) && !empty($apiSecret);
        
        $results['cloudinary_config'] = [
            'status' => $cloudinaryConfigured ? 'OK' : 'FAILED',
            'message' => $cloudinaryConfigured 
                ? 'Cloudinary is configured' 
                : 'Cloudinary NOT configured - Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to environment',
            'has_cloud_name' => !empty($cloudName),
            'has_api_key' => !empty($apiKey),
            'has_api_secret' => !empty($apiSecret),
            'cloud_name_preview' => $cloudName ? substr($cloudName, 0, 3) . '***' : 'NOT SET'
        ];
        
        // Test 5: Cloudinary Class Exists
        try {
            $classExists = class_exists('Cloudinary\Cloudinary');
            $results['cloudinary_package'] = [
                'status' => $classExists ? 'OK' : 'FAILED',
                'message' => $classExists 
                    ? 'Cloudinary package is installed' 
                    : 'Cloudinary package NOT installed - Add to composer.json and run composer install'
            ];
        } catch (\Exception $e) {
            $results['cloudinary_package'] = [
                'status' => 'FAILED',
                'message' => $e->getMessage()
            ];
        }
        
        // Test 6: Category Model
        try {
            $modelExists = class_exists('App\Models\Category');
            $results['category_model'] = [
                'status' => $modelExists ? 'OK' : 'FAILED',
                'message' => $modelExists 
                    ? 'Category model exists' 
                    : 'Category model NOT found'
            ];
            
            if ($modelExists) {
                $model = new Category();
                $fillable = $model->getFillable();
                
                $requiredFillable = ['name', 'small_heading', 'location', 'is_royalty', 'is_special_selection', 'image'];
                $missingFillable = array_diff($requiredFillable, $fillable);
                
                $results['category_model']['fillable'] = $fillable;
                $results['category_model']['missing_fillable'] = array_values($missingFillable);
                
                if (!empty($missingFillable)) {
                    $results['category_model']['status'] = 'WARNING';
                    $results['category_model']['message'] .= ' - Missing fillable properties: ' . implode(', ', $missingFillable);
                }
            }
        } catch (\Exception $e) {
            $results['category_model'] = [
                'status' => 'FAILED',
                'message' => $e->getMessage()
            ];
        }
        
        // Test 7: Storage Permissions
        try {
            $storagePath = storage_path('logs');
            $isWritable = is_writable($storagePath);
            $results['storage_permissions'] = [
                'status' => $isWritable ? 'OK' : 'WARNING',
                'message' => $isWritable 
                    ? 'Storage directory is writable' 
                    : 'Storage directory may not be writable - Logs might not save',
                'path' => $storagePath
            ];
        } catch (\Exception $e) {
            $results['storage_permissions'] = [
                'status' => 'FAILED',
                'message' => $e->getMessage()
            ];
        }
        
        // Test 8: Laravel Log File
        try {
            $logPath = storage_path('logs/laravel.log');
            $logExists = file_exists($logPath);
            $lastLines = [];
            
            if ($logExists && is_readable($logPath)) {
                // Get last 20 lines of log
                $file = new \SplFileObject($logPath, 'r');
                $file->seek(PHP_INT_MAX);
                $lastLine = $file->key();
                $lines = new \LimitIterator($file, max(0, $lastLine - 20), $lastLine);
                $lastLines = iterator_to_array($lines);
            }
            
            $results['laravel_log'] = [
                'status' => $logExists ? 'OK' : 'WARNING',
                'message' => $logExists ? 'Log file exists' : 'Log file not found',
                'path' => $logPath,
                'last_20_lines' => array_values(array_filter($lastLines))
            ];
        } catch (\Exception $e) {
            $results['laravel_log'] = [
                'status' => 'WARNING',
                'message' => $e->getMessage()
            ];
        }
        
        // Overall Status
        $hasFailures = false;
        foreach ($results as $test) {
            if (isset($test['status']) && $test['status'] === 'FAILED') {
                $hasFailures = true;
                break;
            }
        }
        
        return response()->json([
            'overall_status' => $hasFailures ? 'ISSUES FOUND ❌' : 'ALL TESTS PASSED ✓',
            'diagnostics' => $results,
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'timestamp' => now()->toDateTimeString(),
            'instructions' => $hasFailures 
                ? 'Fix the FAILED tests above. Check missing_columns and cloudinary_config especially.' 
                : 'Everything looks good! If still having issues, check laravel_log above for errors.'
        ], $hasFailures ? 500 : 200);
    }
    
    /**
     * Test file upload without Cloudinary
     */
    public function testUpload(Request $request)
    {
        try {
            $results = [
                'request_method' => $request->method(),
                'has_file' => $request->hasFile('image'),
                'all_inputs' => $request->except('image'),
                'files' => []
            ];
            
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $results['file_details'] = [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size_bytes' => $file->getSize(),
                    'size_mb' => round($file->getSize() / 1024 / 1024, 2),
                    'is_valid' => $file->isValid(),
                    'extension' => $file->extension(),
                    'error' => $file->getError()
                ];
            }
            
            return response()->json([
                'success' => true,
                'message' => 'File upload test completed successfully',
                'data' => $results
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString())
            ], 500);
        }
    }
}