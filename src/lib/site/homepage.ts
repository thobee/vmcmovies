import type { Collection, Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import {
  DEFAULT_HOMEPAGE_SETTINGS,
  type HomepageSettings,
} from "@/lib/site/types";

const COLLECTION = "settings";
const HOMEPAGE_ID = "homepage";

type SettingsDoc = Document & HomepageSettings & { _id: string };

async function settingsCollection(): Promise<Collection<SettingsDoc>> {
  const db = await getDb();
  return db.collection<SettingsDoc>(COLLECTION);
}

export async function dbGetHomepageSettings(): Promise<HomepageSettings> {
  const doc = await (await settingsCollection()).findOne({ _id: HOMEPAGE_ID });
  if (!doc) return DEFAULT_HOMEPAGE_SETTINGS;

  const { _id: _ignore, updatedAt, slides, sectionTitles } = doc;
  return {
    slides: slides ?? [],
    sectionTitles: { ...DEFAULT_HOMEPAGE_SETTINGS.sectionTitles, ...sectionTitles },
    updatedAt,
  };
}

export async function dbSaveHomepageSettings(
  settings: HomepageSettings
): Promise<HomepageSettings> {
  const payload: SettingsDoc = {
    _id: HOMEPAGE_ID,
    slides: settings.slides,
    sectionTitles: settings.sectionTitles,
    updatedAt: new Date().toISOString(),
  };

  await (await settingsCollection()).updateOne(
    { _id: HOMEPAGE_ID },
    { $set: payload },
    { upsert: true }
  );

  return dbGetHomepageSettings();
}
