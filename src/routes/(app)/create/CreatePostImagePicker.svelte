<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  let {
    images,
    imagePreviews,
    maxImages,
    imageError,
    onSelectImages,
    onRemoveImage,
  } = $props<{
    images: File[];
    imagePreviews: string[];
    maxImages: number;
    imageError?: string;
    onSelectImages: (e: Event) => void;
    onRemoveImage: (index: number) => void;
  }>();
</script>

<div class="space-y-2">
  <Label for="images">Photos</Label>

  {#if imagePreviews.length > 0}
    <div
      class="scrollbar-hide relative flex gap-2 overflow-x-auto pb-2"
      style="scroll-snap-type: x mandatory;"
    >
      {#each imagePreviews as preview, index (preview)}
        <div
          class="scroll-snap-align-start relative h-48 flex-shrink-0 overflow-hidden rounded-lg"
        >
          <img src={preview} alt="Preview {index + 1}" class="h-full w-auto" />
          <button
            type="button"
            onclick={() => onRemoveImage(index)}
            class="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            aria-label="Remove image"
          >
            <span class="icon-[lucide--x] h-3.5 w-3.5"></span>
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

  {#if images.length < maxImages}
    <div>
      <Label
        for="images-input"
        class="border-input bg-background hover:bg-accent hover:text-accent-foreground flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors"
      >
        <span class="icon-[lucide--image-plus] text-muted-foreground h-6 w-6"
        ></span>
        <span class="text-muted-foreground text-sm font-medium"
          >Click to add photos</span
        >
        <span class="text-muted-foreground text-xs"
          >{images.length}/{maxImages} images</span
        >
      </Label>
      <Input
        id="images-input"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        onchange={onSelectImages}
      />
    </div>
  {/if}

  {#if imageError}
    <p class="text-destructive text-sm">{imageError}</p>
  {/if}
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
