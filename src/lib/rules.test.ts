import type { ImageMetadata } from "astro";
import { describe, expect, test } from "vitest";
import {
  type AlbumData,
  type CollectionData,
  buildAlbum,
  buildCollection,
  indexImages,
  unlistedImages,
} from "./rules";

const LANDSCAPE = { width: 3000, height: 2000 };
const PORTRAIT = { width: 2000, height: 3000 };

/** Images at paths such as "/albums/laos-2023/R0001.jpg", each landscape unless given a size. */
function images(
  paths: Record<string, { width: number; height: number }> | string[],
) {
  const sizes = Array.isArray(paths)
    ? Object.fromEntries(paths.map((path) => [path, LANDSCAPE]))
    : paths;
  const modules = Object.fromEntries(
    Object.entries(sizes).map(([path, size]): [string, ImageMetadata] => [
      path,
      { src: path, format: "jpg", ...size },
    ]),
  );
  return indexImages(modules);
}

function album(
  data: Partial<AlbumData> & Pick<AlbumData, "photos">,
): AlbumData {
  return { title: "Laos", start: "2023-03-01", end: "2023-03-20", ...data };
}

function collection(data: Pick<CollectionData, "photos">): CollectionData {
  return { title: "Concerts", ...data };
}

describe("indexImages", () => {
  test("indexes each image by its file name, with its folder", () => {
    const index = images([
      "/albums/laos-2023/R0001.jpg",
      "/portfolio/concerts/R0002.JPG",
    ]);
    expect(index.get("R0001")?.folder).toBe("albums/laos-2023");
    expect(index.get("R0002")?.folder).toBe("portfolio/concerts");
  });

  test("throws when two folders have a photo with the same file name", () => {
    expect(() =>
      images(["/albums/laos-2023/R0001.jpg", "/albums/vietnam-2023/R0001.jpg"]),
    ).toThrow(
      'Photo file names must be unique, but "R0001" is in both albums/laos-2023 and albums/vietnam-2023',
    );
  });

  test("throws when two files in one folder differ only by extension", () => {
    expect(() =>
      images(["/albums/laos-2023/R0001.jpg", "/albums/laos-2023/R0001.png"]),
    ).toThrow('"R0001" is in both');
  });
});

describe("buildAlbum", () => {
  const laos = images([
    "/albums/laos-2023/R0001.jpg",
    "/albums/laos-2023/R0002.jpg",
    "/albums/vietnam-2023/R0003.jpg",
  ]);

  test("throws when the album ends before it starts", () => {
    const data = album({
      start: "2023-03-20",
      end: "2023-03-01",
      photos: [{ fileName: "R0001" }],
    });
    expect(() => buildAlbum("laos-2023", data, laos)).toThrow(
      'Album "laos-2023" ends before it starts',
    );
  });

  test("allows an album that starts and ends on the same day", () => {
    const data = album({
      start: "2023-03-01",
      end: "2023-03-01",
      photos: [{ fileName: "R0001" }],
    });
    expect(buildAlbum("laos-2023", data, laos)?.subtitle).toBe("March 2023");
  });

  test("throws when the album lists a photo twice", () => {
    const data = album({
      photos: [
        { fileName: "R0001" },
        { fileName: "R0002" },
        { fileName: "R0001" },
      ],
    });
    expect(() => buildAlbum("laos-2023", data, laos)).toThrow(
      'Album "laos-2023" lists "R0001" more than once',
    );
  });

  test("throws when the album lists a photo that no folder has", () => {
    const data = album({ photos: [{ fileName: "R9999" }] });
    expect(() => buildAlbum("laos-2023", data, laos)).toThrow(
      `Album "laos-2023" lists "R9999", but there's no image with that name in its folder`,
    );
  });

  test("throws when the album lists a photo from another album's folder", () => {
    const data = album({ photos: [{ fileName: "R0003" }] });
    expect(() => buildAlbum("laos-2023", data, laos)).toThrow(
      `Album "laos-2023" lists "R0003", but there's no image with that name in its folder`,
    );
  });

  test("returns undefined for an album with no photos yet", () => {
    expect(
      buildAlbum("laos-2023", album({ photos: [] }), laos),
    ).toBeUndefined();
  });

  test("joins the description, country and dates into the subtitle and description", () => {
    const data = album({
      title: "The Mekong",
      description: "Luang Prabang and Vientiane",
      country: "Laos",
      start: "2023-08-28",
      end: "2023-09-04",
      photos: [{ fileName: "R0001" }],
    });
    const built = buildAlbum("laos-2023", data, laos);
    expect(built?.subtitle).toBe(
      "Luang Prabang and Vientiane • Laos • August–September 2023",
    );
    expect(built?.description).toBe(
      "Photos by Chris Johnston from The Mekong, Luang Prabang and Vientiane, Laos, August–September 2023.",
    );
  });

  test("trims captions and locations, drops empty ones and joins them into the alt text", () => {
    const data = album({
      photos: [
        { fileName: "R0001", caption: " Dawn ", location: "Luang Prabang" },
        { fileName: "R0002", caption: "", location: " " },
      ],
    });
    const [first, second] = buildAlbum("laos-2023", data, laos)!.photos;
    expect(first).toMatchObject({
      caption: "Dawn",
      location: "Luang Prabang",
      alt: "Dawn, Luang Prabang",
    });
    expect(second).toMatchObject({
      caption: undefined,
      location: undefined,
      alt: "",
    });
  });
});

describe("album cover", () => {
  const mixed = images({
    "/albums/laos-2023/R0001.jpg": PORTRAIT,
    "/albums/laos-2023/R0002.jpg": LANDSCAPE,
    "/albums/laos-2023/R0003.jpg": LANDSCAPE,
  });
  const photos = [
    { fileName: "R0001" },
    { fileName: "R0002" },
    { fileName: "R0003" },
  ];

  test("uses the photo named by cover", () => {
    expect(
      buildAlbum("laos-2023", album({ cover: "R0003", photos }), mixed)?.cover
        .fileName,
    ).toBe("R0003");
  });

  test("uses the photo named by cover even when it is portrait", () => {
    expect(
      buildAlbum("laos-2023", album({ cover: "R0001", photos }), mixed)?.cover
        .fileName,
    ).toBe("R0001");
  });

  test("falls back to the first landscape photo without a cover", () => {
    expect(
      buildAlbum("laos-2023", album({ photos }), mixed)?.cover.fileName,
    ).toBe("R0002");
  });

  test("falls back to the first photo when none is landscape", () => {
    const portraits = images({
      "/albums/laos-2023/R0001.jpg": PORTRAIT,
      "/albums/laos-2023/R0002.jpg": PORTRAIT,
    });
    const data = album({
      photos: [{ fileName: "R0002" }, { fileName: "R0001" }],
    });
    expect(buildAlbum("laos-2023", data, portraits)?.cover.fileName).toBe(
      "R0002",
    );
  });
});

describe("buildCollection", () => {
  const index = images([
    "/albums/laos-2023/R0001.jpg",
    "/portfolio/concerts/R0002.jpg",
    "/portfolio/festivals/R0003.jpg",
  ]);
  const albumIds = new Set(["laos-2023"]);

  test("throws when the collection has the same URL as an album", () => {
    expect(() =>
      buildCollection("laos-2023", collection({ photos: [] }), index, albumIds),
    ).toThrow(
      'Collection "laos-2023" has the same URL as an album; rename one of their folders',
    );
  });

  test("throws when the collection lists a photo twice", () => {
    const data = collection({
      photos: [{ fileName: "R0001" }, { fileName: "R0001" }],
    });
    expect(() => buildCollection("concerts", data, index, albumIds)).toThrow(
      'Collection "concerts" lists "R0001" more than once',
    );
  });

  test("throws when the collection lists a photo that no folder has", () => {
    const data = collection({ photos: [{ fileName: "R9999" }] });
    expect(() => buildCollection("concerts", data, index, albumIds)).toThrow(
      `Collection "concerts" lists "R9999", which isn't in its folder or any album`,
    );
  });

  test("throws when the collection lists a photo from another collection's folder", () => {
    const data = collection({ photos: [{ fileName: "R0003" }] });
    expect(() => buildCollection("concerts", data, index, albumIds)).toThrow(
      `Collection "concerts" lists "R0003", which isn't in its folder or any album`,
    );
  });

  test("uses photos from its own folder and from any album, with its own text", () => {
    const data = collection({
      photos: [
        { fileName: "R0001", caption: "Encore" },
        {
          fileName: "R0002",
          caption: "Soundcheck",
          location: "Sydney Opera House",
        },
      ],
    });
    const built = buildCollection("concerts", data, index, albumIds);
    expect(
      built.photos.map(({ fileName, caption, location }) => ({
        fileName,
        caption,
        location,
      })),
    ).toEqual([
      { fileName: "R0001", caption: "Encore", location: undefined },
      {
        fileName: "R0002",
        caption: "Soundcheck",
        location: "Sydney Opera House",
      },
    ]);
  });
});

describe("unlistedImages", () => {
  test("lists images that no album.json or collection.json lists", () => {
    const index = images([
      "/albums/laos-2023/R0001.jpg",
      "/albums/laos-2023/R0002.jpg",
      "/portfolio/concerts/R0003.jpg",
    ]);
    const albums = [
      { id: "laos-2023", data: album({ photos: [{ fileName: "R0001" }] }) },
    ];
    const collections = [
      { id: "concerts", data: collection({ photos: [{ fileName: "R0001" }] }) },
    ];
    expect(unlistedImages(index, albums, collections)).toEqual([
      "albums/laos-2023/R0002",
      "portfolio/concerts/R0003",
    ]);
  });
});
