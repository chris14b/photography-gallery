import type { ImageMetadata } from "astro";
import { describe, expect, test } from "vitest";
import {
  type AlbumData,
  type CollectionData,
  buildAlbum,
  buildCollection,
  countPhotos,
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

function collection(
  data: Partial<CollectionData> & Pick<CollectionData, "photos">,
): CollectionData {
  return { title: "Concerts", ...data };
}

describe("indexImages", () => {
  test("indexes each image by its file name, with its folder", () => {
    const index = images([
      "/albums/laos-2023/R0001.jpg",
      "/collections/concerts/R0002.jpg",
    ]);
    expect(index.get("R0001.jpg")?.folder).toBe("albums/laos-2023");
    expect(index.get("R0002.jpg")?.folder).toBe("collections/concerts");
  });

  test("throws when two folders have a photo with the same file name", () => {
    expect(() =>
      images(["/albums/laos-2023/R0001.jpg", "/albums/vietnam-2023/R0001.jpg"]),
    ).toThrow(
      'Photo file names must be unique, but "R0001.jpg" is in both albums/laos-2023 and albums/vietnam-2023',
    );
  });

  test("throws when an album and a collection have a photo with the same file name", () => {
    expect(() =>
      images([
        "/albums/laos-2023/R0001.jpg",
        "/collections/concerts/R0001.jpg",
      ]),
    ).toThrow('"R0001.jpg" is in both');
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
      photos: [{ file: "R0001.jpg" }],
    });
    expect(() => buildAlbum("laos-2023", data, laos)).toThrow(
      'Album "laos-2023" ends before it starts',
    );
  });

  test("allows an album that starts and ends on the same day", () => {
    const data = album({
      start: "2023-03-01",
      end: "2023-03-01",
      photos: [{ file: "R0001.jpg" }],
    });
    expect(buildAlbum("laos-2023", data, laos)?.subtitle).toBe("March 2023");
  });

  test("shows an album with no end as ongoing", () => {
    const data = album({
      start: "2023-03-01",
      end: undefined,
      photos: [{ file: "R0001.jpg" }],
    });
    expect(buildAlbum("laos-2023", data, laos)?.subtitle).toBe(
      "March 2023 – present",
    );
  });

  test("throws when the album lists a photo twice", () => {
    const data = album({
      photos: [
        { file: "R0001.jpg" },
        { file: "R0002.jpg" },
        { file: "R0001.jpg" },
      ],
    });
    expect(() => buildAlbum("laos-2023", data, laos)).toThrow(
      'Album "laos-2023" lists "R0001.jpg" more than once',
    );
  });

  test("throws when the album lists a photo that no folder has", () => {
    const data = album({ photos: [{ file: "R9999.jpg" }] });
    expect(() => buildAlbum("laos-2023", data, laos)).toThrow(
      `Album "laos-2023" lists "R9999.jpg", but there's no image with that name in its folder`,
    );
  });

  test("throws when the album lists a photo from another album's folder", () => {
    const data = album({ photos: [{ file: "R0003.jpg" }] });
    expect(() => buildAlbum("laos-2023", data, laos)).toThrow(
      `Album "laos-2023" lists "R0003.jpg", but there's no image with that name in its folder`,
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
      photos: [{ file: "R0001.jpg" }],
    });
    const built = buildAlbum("laos-2023", data, laos);
    expect(built?.subtitle).toBe(
      "Luang Prabang and Vientiane · Laos · August–September 2023",
    );
    expect(built?.description).toBe(
      "Photos by Chris Johnston from The Mekong, Luang Prabang and Vientiane, Laos, August–September 2023.",
    );
    expect(built?.dates).toEqual(["2023-08-28", "2023-09-04"]);
  });

  test("joins the caption and location into the alt text, leaving out missing ones", () => {
    const data = album({
      photos: [
        { file: "R0001.jpg", caption: "Dawn", location: "Luang Prabang" },
        { file: "R0002.jpg" },
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
    { file: "R0001.jpg" },
    { file: "R0002.jpg" },
    { file: "R0003.jpg" },
  ];

  test("uses the photo named by cover", () => {
    expect(
      buildAlbum("laos-2023", album({ cover: "R0003.jpg", photos }), mixed)
        ?.cover.file,
    ).toBe("R0003.jpg");
  });

  test("uses the photo named by cover even when it is portrait", () => {
    expect(
      buildAlbum("laos-2023", album({ cover: "R0001.jpg", photos }), mixed)
        ?.cover.file,
    ).toBe("R0001.jpg");
  });

  test("throws when cover names a photo that isn't in the album", () => {
    const data = album({ cover: "R0009.jpg", photos });
    expect(() => buildAlbum("laos-2023", data, mixed)).toThrow(
      `Album "laos-2023" has cover "R0009.jpg", which isn't one of its photos`,
    );
  });

  test("falls back to the first photo without a cover, even when it is portrait", () => {
    expect(buildAlbum("laos-2023", album({ photos }), mixed)?.cover.file).toBe(
      "R0001.jpg",
    );
  });
});

describe("buildCollection", () => {
  const index = images([
    "/albums/laos-2023/R0001.jpg",
    "/collections/concerts/R0002.jpg",
    "/collections/festivals/R0003.jpg",
  ]);
  const albumIds = new Set(["laos-2023"]);

  test("throws when the collection has the same URL as an album", () => {
    expect(() =>
      buildCollection(
        "laos-2023",
        collection({ photos: [{ file: "R0001.jpg" }] }),
        index,
        albumIds,
      ),
    ).toThrow(
      'Collection "laos-2023" has the same URL as an album; rename one of their folders',
    );
  });

  test("throws when the collection has no photos", () => {
    expect(() =>
      buildCollection("concerts", collection({ photos: [] }), index, albumIds),
    ).toThrow(
      'Collection "concerts" has no photos; add some or delete its folder',
    );
  });

  test("throws when the collection lists a photo twice", () => {
    const data = collection({
      photos: [{ file: "R0001.jpg" }, { file: "R0001.jpg" }],
    });
    expect(() => buildCollection("concerts", data, index, albumIds)).toThrow(
      'Collection "concerts" lists "R0001.jpg" more than once',
    );
  });

  test("throws when the collection lists a photo that no folder has", () => {
    const data = collection({ photos: [{ file: "R9999.jpg" }] });
    expect(() => buildCollection("concerts", data, index, albumIds)).toThrow(
      `Collection "concerts" lists "R9999.jpg", which isn't in its folder or any album`,
    );
  });

  test("throws when the collection lists a photo from another collection's folder", () => {
    const data = collection({ photos: [{ file: "R0003.jpg" }] });
    expect(() => buildCollection("concerts", data, index, albumIds)).toThrow(
      `Collection "concerts" lists "R0003.jpg", which isn't in its folder or any album`,
    );
  });

  test("uses photos from its own folder and from any album, with its own text", () => {
    const data = collection({
      photos: [
        { file: "R0001.jpg", caption: "Encore" },
        {
          file: "R0002.jpg",
          caption: "Soundcheck",
          location: "Sydney Opera House",
        },
      ],
    });
    const built = buildCollection("concerts", data, index, albumIds);
    expect(
      built.photos.map(({ file, caption, location }) => ({
        file,
        caption,
        location,
      })),
    ).toEqual([
      { file: "R0001.jpg", caption: "Encore", location: undefined },
      {
        file: "R0002.jpg",
        caption: "Soundcheck",
        location: "Sydney Opera House",
      },
    ]);
  });

  test("shows its description under the title and in search results", () => {
    const data = collection({
      description: "Live music in Sydney",
      photos: [{ file: "R0002.jpg" }],
    });
    expect(buildCollection("concerts", data, index, albumIds)).toMatchObject({
      subtitle: "Live music in Sydney",
      description: "Live music in Sydney",
    });
  });

  test("falls back to a sentence for search results without a description", () => {
    const data = collection({ photos: [{ file: "R0002.jpg" }] });
    const built = buildCollection("concerts", data, index, albumIds);
    expect(built.subtitle).toBeUndefined();
    expect(built.description).toBe("Concerts photos by Chris Johnston.");
  });

  test("uses its first photo as its cover", () => {
    const data = collection({
      photos: [{ file: "R0002.jpg" }, { file: "R0001.jpg" }],
    });
    expect(buildCollection("concerts", data, index, albumIds).cover.file).toBe(
      "R0002.jpg",
    );
  });

  test("uses the photo named by cover without reordering its photos", () => {
    const data = collection({
      cover: "R0001.jpg",
      photos: [{ file: "R0002.jpg" }, { file: "R0001.jpg" }],
    });
    const built = buildCollection("concerts", data, index, albumIds);
    expect(built.cover.file).toBe("R0001.jpg");
    expect(built.photos.map(({ file }) => file)).toEqual([
      "R0002.jpg",
      "R0001.jpg",
    ]);
  });

  test("throws when cover names a photo that isn't in the collection", () => {
    const data = collection({
      cover: "R0009.jpg",
      photos: [{ file: "R0002.jpg" }],
    });
    expect(() => buildCollection("concerts", data, index, albumIds)).toThrow(
      `Collection "concerts" has cover "R0009.jpg", which isn't one of its photos`,
    );
  });
});

describe("countPhotos", () => {
  const index = images([
    "/albums/laos-2023/R0001.jpg",
    "/albums/laos-2023/R0002.jpg",
  ]);

  test("counts one photo", () => {
    const built = buildAlbum(
      "laos-2023",
      album({ photos: [{ file: "R0001.jpg" }] }),
      index,
    )!;
    expect(countPhotos(built)).toBe("1 photo");
  });

  test("counts several photos", () => {
    const built = buildAlbum(
      "laos-2023",
      album({ photos: [{ file: "R0001.jpg" }, { file: "R0002.jpg" }] }),
      index,
    )!;
    expect(countPhotos(built)).toBe("2 photos");
  });
});

describe("unlistedImages", () => {
  test("lists images that no album.json or collection.json lists", () => {
    const index = images([
      "/albums/laos-2023/R0001.jpg",
      "/albums/laos-2023/R0002.jpg",
      "/collections/concerts/R0003.jpg",
    ]);
    const albums = [
      { id: "laos-2023", data: album({ photos: [{ file: "R0001.jpg" }] }) },
    ];
    const collections = [
      { id: "concerts", data: collection({ photos: [{ file: "R0001.jpg" }] }) },
    ];
    expect(unlistedImages(index, albums, collections)).toEqual([
      "albums/laos-2023/R0002.jpg",
      "collections/concerts/R0003.jpg",
    ]);
  });
});
