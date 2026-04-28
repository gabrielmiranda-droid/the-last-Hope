import { CHARACTER_OPTIONS } from "./characters";

export const ASSET_PATHS = {
  audio: {
    jump: "/assets/audio/jump.mp3",
    impact: "/assets/audio/impacto.mp3",
    respawn: "/assets/audio/barulho da morte.mp3",
    gameOver: "/assets/audio/gameover.mp3",
    gameplayMusic: "/assets/audio/trilhasonora.mp3",
    menuMusic: "/assets/audio/tela%20de%20inicio.mp3"
  },
  backgrounds: {
    sky: "/assets/kenney_pixel_platformer/Tiles/Backgrounds/tile_0000.png",
    clouds: "/assets/kenney_pixel_platformer/Tiles/Backgrounds/tile_0008.png",
    cloudsTall: "/assets/kenney_pixel_platformer/Tiles/Backgrounds/tile_0009.png",
    dunes: "/assets/kenney_pixel_platformer/Tiles/Backgrounds/tile_0012.png"
  },
  centralCity: {
    tiles: "/assets/central_city/Sidescroller Shooter - Central City/Assets/Tiles.png",
    buildings: "/assets/central_city/Sidescroller Shooter - Central City/Assets/Buildings.png",
    props: "/assets/central_city/Sidescroller Shooter - Central City/Assets/Props-01.png",
    bgBase: "/assets/central_city/Sidescroller Shooter - Central City/Background/Base Color.png",
    bgProps: "/assets/central_city/Sidescroller Shooter - Central City/Background/Background Props.png",
    midFog: "/assets/central_city/Sidescroller Shooter - Central City/Background/Mid Fog.png",
    frontalFog: "/assets/central_city/Sidescroller Shooter - Central City/Background/Frontal Fog.png"
  },
  forestFantasy: {
    bg1: "/assets/forest_fantasy/Fantasy Swamp Forest/Free/BG_1/BG_1.png",
    bg2: "/assets/forest_fantasy/Fantasy Swamp Forest/Free/BG_2/BG_2.png",
    bg3: "/assets/forest_fantasy/Fantasy Swamp Forest/Free/BG_3/BG_3.png",
    bg3Alt: "/assets/forest_fantasy/Fantasy Swamp Forest/Free/BG_3/BG_3_alt.png",
    terrain: "/assets/forest_fantasy/Fantasy Swamp Forest/Free/Terrain_and_Props.png"
  },
  tiles: {
    groundLeft: "/assets/kenney_pixel_platformer/Tiles/tile_0040.png",
    groundCenter: "/assets/kenney_pixel_platformer/Tiles/tile_0041.png",
    groundRight: "/assets/kenney_pixel_platformer/Tiles/tile_0042.png",
    groundSingle: "/assets/kenney_pixel_platformer/Tiles/tile_0043.png",
    dirtA: "/assets/kenney_pixel_platformer/Tiles/tile_0005.png",
    dirtB: "/assets/kenney_pixel_platformer/Tiles/tile_0121.png",
    dirtC: "/assets/kenney_pixel_platformer/Tiles/tile_0122.png",
    dirtD: "/assets/kenney_pixel_platformer/Tiles/tile_0123.png",
    dirtPebble: "/assets/kenney_pixel_platformer/Tiles/tile_0120.png",
    crate: "/assets/kenney_pixel_platformer/Tiles/tile_0050.png",
    breakable: "/assets/kenney_pixel_platformer/Tiles/tile_0030.png",
    metalPlatform: "/assets/kenney_pixel_platformer/Tiles/tile_0091.png",
    pipeElbowA: "/assets/kenney_pixel_platformer/Tiles/tile_0093.png",
    pipeElbowB: "/assets/kenney_pixel_platformer/Tiles/tile_0094.png",
    pipeVertical: "/assets/kenney_pixel_platformer/Tiles/tile_0095.png",
    pipeJoint: "/assets/kenney_pixel_platformer/Tiles/tile_0115.png",
    signArrow: "/assets/kenney_pixel_platformer/Tiles/tile_0088.png",
    signBoard: "/assets/kenney_pixel_platformer/Tiles/tile_0085.png",
    post: "/assets/kenney_pixel_platformer/Tiles/tile_0072.png",
    sprout: "/assets/kenney_pixel_platformer/Tiles/tile_0124.png",
    gem: "/assets/kenney_pixel_platformer/Tiles/tile_0067.png"
  }
} as const;

export function getAllImageAssetPaths() {
  const characterAnimationPaths = CHARACTER_OPTIONS.flatMap((character) =>
    Object.values(character.animations).map((animation) => animation.path)
  );

  return [
    ...characterAnimationPaths,
    ...Object.values(ASSET_PATHS.backgrounds),
    ...Object.values(ASSET_PATHS.centralCity),
    ...Object.values(ASSET_PATHS.forestFantasy),
    ...Object.values(ASSET_PATHS.tiles)
  ];
}
