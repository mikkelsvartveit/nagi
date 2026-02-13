<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import CreatePostImagePicker from "./CreatePostImagePicker.svelte";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Progress } from "$lib/components/ui/progress";
  import { Textarea } from "$lib/components/ui/textarea";
  import type { Create } from "$lib/pocketbase-typegen";

  type FieldErrors = Partial<Record<keyof Create<"posts">, string>>;

  let caption = $state("");
  let location = $state("");
  let images = $state<File[]>([]);
  let imagePreviews = $state<string[]>([]);
  let loading = $state(false);
  let uploadProgress = $state(0);
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

  const uploadWithProgress = (formData: FormData): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          uploadProgress = Math.round((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", "/api/collections/posts/records");

      const token = pb.authStore.token;
      if (token) {
        xhr.setRequestHeader("Authorization", token);
      }

      xhr.send(formData);
    });
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    loading = true;
    uploadProgress = 0;
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
      await uploadWithProgress(formData);
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

<div class="pt-6">
  <h1 class="mb-6 text-xl font-semibold">Create post</h1>

  <div class="max-h-[calc(100dvh-140px)] overflow-y-auto">
    <form onsubmit={handleSubmit} class="space-y-6">
      <CreatePostImagePicker
        {images}
        {imagePreviews}
        maxImages={MAX_IMAGES}
        imageError={errors.images}
        onSelectImages={handleImageSelect}
        onRemoveImage={removeImage}
      />

      <div class="space-y-2">
        <Label for="caption">Caption</Label>
        <Textarea
          id="caption"
          bind:value={caption}
          placeholder="Write a caption..."
          rows={3}
        />
      </div>

      <div class="space-y-2">
        <Label for="location">Location</Label>
        <Input
          id="location"
          type="text"
          bind:value={location}
          placeholder="Add location"
        />
      </div>

      {#if loading}
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Uploading photos...</span>
            <span class="text-muted-foreground font-medium"
              >{uploadProgress}%</span
            >
          </div>
          <Progress value={uploadProgress} max={100} />
        </div>
      {/if}
      <Button
        type="submit"
        class="w-full"
        disabled={loading || images.length === 0}
      >
        {#if loading}
          <span class="icon-[lucide--loader-2] mr-2 h-4 w-4 animate-spin"
          ></span>
          Creating post...
        {:else}
          Share
        {/if}
      </Button>
    </form>
  </div>
</div>
