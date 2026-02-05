<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import type { Create } from "$lib/pocketbase-typegen";

  type FieldErrors = Partial<Record<keyof Create<"posts">, string>>;

  let caption = $state("");
  let location = $state("");
  let images = $state<File[]>([]);
  let imagePreviews = $state<string[]>([]);
  let loading = $state(false);
  let errors = $state<FieldErrors>({});

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  const MAX_IMAGES = 10;

  function handleImageSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    // Check total count
    const totalImages = images.length + files.length;
    if (totalImages > MAX_IMAGES) {
      errors = { ...errors, images: `Maximum ${MAX_IMAGES} images allowed` };
      input.value = "";
      return;
    }

    // Validate file sizes
    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(file.name);
      } else if (!file.type.startsWith("image/")) {
        invalidFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      errors = {
        ...errors,
        images: `${invalidFiles.length} file(s) invalid (must be images under 15MB)`,
      };
    } else {
      errors = { ...errors, images: undefined };
    }

    // Create previews for valid files
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    images = [...images, ...validFiles];
    imagePreviews = [...imagePreviews, ...newPreviews];

    input.value = "";
  }

  function removeImage(index: number) {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    images = images.filter((_, i) => i !== index);
    imagePreviews = imagePreviews.filter((_, i) => i !== index);

    if (images.length === 0) {
      errors = { ...errors, images: undefined };
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    loading = true;
    errors = {};

    const user = pb.authStore.model;
    if (!user) {
      errors = { images: "You must be logged in to create a post." };
      loading = false;
      return;
    }

    const formData = new FormData();
    formData.append("user", user.id);
    formData.append("caption", caption);
    formData.append("location", location);

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await pb.collection("posts").create(formData);
      goto(resolve("/"));
    } catch (err: unknown) {
      console.error("Failed to create post:", err);
      errors = { images: "Failed to create post. Please try again." };
    } finally {
      loading = false;
    }
  };

  // Cleanup object URLs on component destroy
  $effect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  });
</script>

<div class="max-h-[calc(100dvh-140px)] overflow-y-auto">
  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Image Upload -->
    <div class="space-y-2">
      <Label for="images">Photos</Label>

      <!-- Image Carousel -->
      {#if imagePreviews.length > 0}
        <div
          class="scrollbar-hide relative flex gap-2 overflow-x-auto pb-2"
          style="scroll-snap-type: x mandatory;"
        >
          {#each imagePreviews as preview, index (preview)}
            <div
              class="scroll-snap-align-start relative aspect-square h-48 flex-shrink-0 overflow-hidden rounded-lg"
            >
              <img
                src={preview}
                alt="Preview {index + 1}"
                class="h-full w-full object-cover"
              />
              <button
                type="button"
                onclick={() => removeImage(index)}
                class="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                aria-label="Remove image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <div
                class="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white"
              >
                {index + 1}/{images.length}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Upload Button -->
      {#if images.length < MAX_IMAGES}
        <div>
          <Label
            for="images-input"
            class="border-input bg-background hover:bg-accent hover:text-accent-foreground flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-muted-foreground"
            >
              <path
                d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
              />
              <line x1="9" x2="15" y1="12" y2="12" />
              <line x1="12" x2="12" y1="9" y2="15" />
            </svg>
            <span class="text-muted-foreground text-sm font-medium">
              Click to add photos
            </span>
            <span class="text-muted-foreground text-xs">
              {images.length}/{MAX_IMAGES} images
            </span>
          </Label>
          <Input
            id="images-input"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            onchange={handleImageSelect}
          />
        </div>
      {/if}

      {#if errors.images}
        <p class="text-destructive text-sm">{errors.images}</p>
      {/if}
    </div>

    <!-- Caption -->
    <div class="space-y-2">
      <Label for="caption">Caption</Label>
      <Textarea
        id="caption"
        bind:value={caption}
        placeholder="Write a caption..."
        rows={3}
      />
    </div>

    <!-- Location -->
    <div class="space-y-2">
      <Label for="location">Location</Label>
      <Input
        id="location"
        type="text"
        bind:value={location}
        placeholder="Add location"
      />
    </div>

    <!-- Submit Button -->
    <Button
      type="submit"
      class="w-full"
      disabled={loading || images.length === 0}
    >
      {#if loading}
        <svg
          class="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Creating post...
      {:else}
        Share
      {/if}
    </Button>
  </form>
</div>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
