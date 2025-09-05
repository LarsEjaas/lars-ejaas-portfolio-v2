import BlueskyData from './../collections/bluesky/devtips_data.json' assert { type: 'json' };

export const DEVELOPER_TIPS_PAGESIZE = 20;
export const DEVELOPER_TIPS_PAGES = Math.ceil(
  (BlueskyData?.threads?.length || 1) / DEVELOPER_TIPS_PAGESIZE
);
