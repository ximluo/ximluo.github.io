let bunnyAssetsPrefetched = false

export const preloadBunnyAssets = () => {
  if (bunnyAssetsPrefetched || typeof window === "undefined") return
  bunnyAssetsPrefetched = true

  // Warm the model request so opening the modal does not pay the network cost.
  void fetch("/models/rabbit.glb").catch(() => {
    // Allow another attempt if the first prefetch fails.
    bunnyAssetsPrefetched = false
  })
}
