import * as MediaLibrary from "expo-media-library";

export default async function getAllAppPhotos() {
  const album = await MediaLibrary.getAlbumAsync("GhostPin");

  if (!album) {
    console.log("Album not found");
    return [];
  }

  const photos = await MediaLibrary.getAssetsAsync({
    album: album,
    mediaType: ['photo'],
    sortBy: [['creationTime', false]], // latest first
  });

  return photos.assets; // array of photo info
};
