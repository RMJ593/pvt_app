public function run()
{
    \App\Models\User::create([
        'name' => 'Admin',
        'email' => 'admin@example.com',
        'password' => bcrypt('Admin@123'),
        'role_id' => 1,
        'status' => 'active',
    ]);
}