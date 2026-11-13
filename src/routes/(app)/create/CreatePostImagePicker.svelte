<script lang="ts">
  import { flip } from "svelte/animate";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { cn } from "$lib/utils";

  let {
    images,
    imagePreviews,
    maxImages,
    imageError,
    onAddImages,
    onRemoveImage,
    onMoveImage,
  }: {
    images: File[];
    imagePreviews: string[];
    maxImages: number;
    imageError?: string;
    onAddImages: (files: File[]) => void;
    onRemoveImage: (index: number) => void;
    onMoveImage: (from: number, to: number) => void;
  } = $props();

  // Thumbnail being dragged to reorder, and the thumbnail it would land on
  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);

  // dragenter/dragleave fire for every child element, so count them to know
  // whether files from the OS are still hovering over the picker
  let fileDragDepth = $state(0);
  const isDraggingFiles = $derived(fileDragDepth > 0);

  const hasFiles = (e: DragEvent) =>
    e.dataTransfer?.types.includes("Files") ?? false;

  function handleInputChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    if (input.files) onAddImages(Array.from(input.files));
    input.value = "";
  }

  // --- Dropping files from the OS to add them ---

  function handleFileDragEnter(e: DragEvent) {
    if (hasFiles(e)) fileDragDepth++;
  }

  function handleFileDragLeave(e: DragEvent) {
    if (hasFiles(e)) fileDragDepth = Math.max(0, fileDragDepth - 1);
  }

  function handleFileDragOver(e: DragEvent) {
    if (!hasFiles(e) || !e.dataTransfer) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleFileDrop(e: DragEvent) {
    if (!hasFiles(e) || !e.dataTransfer) return;
    e.preventDefault();
    fileDragDepth = 0;
    onAddImages(Array.from(e.dataTransfer.files));
  }

  // --- Dragging thumbnails to reorder them ---

  function handleThumbDragStart(e: DragEvent, index: number) {
    if (!e.dataTransfer) return;
    dragIndex = index;
    e.dataTransfer.effectAllowed = "move";
    // Firefox won't start a drag without data
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleThumbDragOver(e: DragEvent, index: number) {
    if (dragIndex === null || !e.dataTransfer) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dropIndex = index;
  }

  function handleThumbDrop(e: DragEvent, index: number) {
    if (dragIndex === null) return;
    e.preventDefault();
    if (dragIndex !== index) onMoveImage(dragIndex, index);
    resetThumbDrag();
  }

  function resetThumbDrag() {
    dragIndex = null;
    dropIndex = null;
  }
</script>

<div
  class="space-y-2"
  role="group"
  aria-label="Photos"
  ondragenter={handleFileDragEnter}
  ondragleave={handleFileDragLeave}
  ondragover={handleFileDragOver}
  ondrop={handleFileDrop}
>
  <Label for="images-input">Photos</Label>

  {#if imagePreviews.length > 0}
    <div
      class="scrollbar-hide relative flex gap-2 overflow-x-auto pb-2"
      style="scroll-snap-type: x mandatory;"
      role="list"
    >
      {#each imagePreviews as preview, index (preview)}
        <div
          animate:flip={{ duration: 200 }}
          draggable={images.length > 1}
          role="listitem"
          ondragstart={(e) => handleThumbDragStart(e, index)}
          ondragover={(e) => handleThumbDragOver(e, index)}
          ondrop={(e) => handleThumbDrop(e, index)}
          ondragend={resetThumbDrag}
          class={cn(
            "scroll-snap-align-start relative h-48 flex-shrink-0 overflow-hidden rounded-lg transition-opacity",
            images.length > 1 && "cursor-grab active:cursor-grabbing",
            dragIndex === index && "opacity-40",
            dropIndex === index &&
              dragIndex !== index &&
              "outline-primary outline-3 -outline-offset-3",
          )}
        >
          <img
            src={preview}
            alt="Preview {index + 1}"
            class="pointer-events-none h-full w-auto select-none"
            draggable="false"
          />

          {#if images.length > 1}
            <div class="absolute top-2 left-2 flex gap-2">
              <button
                type="button"
                onclick={() => onMoveImage(index, index - 1)}
                class="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Move image left"
                disabled={index === 0}
              >
                <span class="icon-[lucide--arrow-left] h-4 w-4"></span>
              </button>
              <button
                type="button"
                onclick={() => onMoveImage(index, index + 1)}
                class="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Move image right"
                disabled={index === images.length - 1}
              >
                <span class="icon-[lucide--arrow-right] h-4 w-4"></span>
              </button>
            </div>
          {/if}

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
        class={cn(
          "border-input bg-background hover:bg-accent hover:text-accent-foreground flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors",
          isDraggingFiles && "border-primary bg-accent",
        )}
      >
        <span class="icon-[lucide--image-plus] text-muted-foreground h-6 w-6"
        ></span>
        <span class="text-muted-foreground text-sm font-medium">
          {isDraggingFiles
            ? "Drop to add photos"
            : "Click or drop to add photos"}
        </span>
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
        onchange={handleInputChange}
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
