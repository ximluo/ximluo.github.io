let bunnyAssetsPrefetched = false

export const preloadBunnyAssets = () => {
  if (bunnyAssetsPrefetched || typeof window === "undefined") return
  bunnyAssetsPrefetched = true

  void fetch("/models/rabbit.glb").catch(() => {
    bunnyAssetsPrefetched = false
  })
}
