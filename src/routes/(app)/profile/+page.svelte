<script lang="ts">
  let { data } = $props();
  const user = $derived(data.user);
</script>

<div class="text-center">
  <div
    class="bg-muted mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="text-muted-foreground h-10 w-10"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  </div>
  <h1 class="text-xl font-semibold">{user?.name || "@" + user?.username}</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    {user?.name ? "@" + user.username : ""}
  </p>
</div>

<!-- Stats -->
<div class="mt-6 flex justify-center gap-8">
  <div class="text-center">
    <p class="text-lg font-semibold">0</p>
    <p class="text-muted-foreground text-sm">Posts</p>
  </div>
  <div class="text-center">
    <p class="text-lg font-semibold">0</p>
    <p class="text-muted-foreground text-sm">Followers</p>
  </div>
  <div class="text-center">
    <p class="text-lg font-semibold">0</p>
    <p class="text-muted-foreground text-sm">Following</p>
  </div>
</div>

<!-- Posts Grid Placeholder -->
<div class="bg-card mt-8 rounded-xl border p-8 text-center">
  <div
    class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="text-muted-foreground h-6 w-6"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  </div>
  <h2 class="font-medium">No posts yet</h2>
  <p class="text-muted-foreground mt-1 text-sm">Your posts will appear here</p>
</div>
