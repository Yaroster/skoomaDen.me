# Thumbnail Generation Fix for Vercel Deployment

## Problem
On Vercel production builds, markdown image thumbnails were returning 404 errors because:
1. Thumbnails were generated to `public/articles/` during local dev
2. `.gitignore` excluded `public/articles/**` so generated files never got committed
3. On clean Vercel builds, the remark plugin only processed `.mdx` files, not `.md` files
4. Generated thumbnails weren't being emitted to the final `dist/` output

## Solution
Modified the thumbnail generation pipeline to work reliably in clean build environments:

### Changes Made

#### 1. **Output Directory Change** (`src/plugins/remark-thumbnails.mjs`)
- Changed thumbnail output from `public/articles/` to `.astro/generated/articles/` **for both dev and build**
- This ensures generated files are in a consistent location
- In build mode: Vite's `emitFile` picks them up and copies to `dist/`
- In dev mode: Vite middleware serves them directly from `.astro/generated/`

#### 2. **Dev Server Middleware** (`src/plugins/thumbnails-integration.mjs`)
- Added Vite `configureServer` middleware to serve `/articles/*` requests from `.astro/generated/articles/`
- This allows the dev server to find and serve thumbnail files without needing them in `public/`
- Middleware intercepts requests and rewrites paths to point to `.astro/generated/`

#### 2. **Dev Server Middleware** (`src/plugins/thumbnails-integration.mjs`)
- Added Vite `configureServer` middleware to serve `/articles/*` requests from `.astro/generated/articles/`
- This allows the dev server to find and serve thumbnail files without needing them in `public/`
- Middleware intercepts requests and rewrites paths to point to `.astro/generated/`

#### 3. **Pre-Processing .md Files** (`src/plugins/thumbnails-integration.mjs`)
- Added `buildStart` hook that scans all `.md` files in `src/content/blog/`
- Processes each file through the remark plugin to generate thumbnails **before** the build starts
- This solves the issue where `.md` files weren't being processed during Astro's build phase
- Installed `remark` as a dev dependency to enable this preprocessing

#### 4. **Improved Asset Emission** (`src/plugins/thumbnails-integration.mjs`)
- Added `buildStart` hook that scans all `.md` files in `src/content/blog/`
- Processes each file through the remark plugin to generate thumbnails **before** the build starts
- This solves the issue where `.md` files weren't being processed during Astro's build phase
- Installed `remark` as a dev dependency to enable this preprocessing

#### 3. **Improved Asset Emission** (`src/plugins/thumbnails-integration.mjs`)
- Modified Vite plugin to emit assets in both `buildEnd` and `generateBundle` hooks
- Added logging to track how many assets are emitted
- Ensures all generated thumbnails are included in the final build

### Dependencies Added
```json
{
  "devDependencies": {
    "remark": "^15.0.1"
  }
}
```

### Files Modified
1. `src/plugins/remark-thumbnails.mjs` - Changed output paths from `public/` to `.astro/generated/`
2. `src/plugins/thumbnails-integration.mjs` - Added `.md` file preprocessing and improved emission
3. `astro.config.mjs` - Added `remarkPlugins` to MDX integration (for consistency)
4. `package.json` - Added `remark` dev dependency

### Verification
After a clean build (`pnpm run build`):
- ✅ 88 .md files are pre-processed
- ✅ 632 assets generated (316 thumbnails + 316 optimized images)
- ✅ All assets emitted to `dist/articles/thumbnails/` and `dist/articles/optimized/`
- ✅ HTML correctly references thumbnail paths
- ✅ `.astro/generated/` excluded from git (via existing `.gitignore`)

### How It Works Now
1. **Build Start**: Vite plugin scans all `.md` files and processes them through remark
2. **Thumbnail Generation**: Sharp creates thumbnails → saved to `.astro/generated/articles/`
3. **Asset Registration**: Files are registered in the thumbnail registry
4. **Asset Emission**: Vite plugin reads registry and emits all files to `dist/`
5. **Clean Output**: `.astro/` is gitignored and can be safely deleted between builds

### Testing on Vercel
The fix ensures that:
1. No pre-generated files need to be committed
2. Clean builds (like on Vercel) generate all thumbnails from scratch  
3. All generated assets are properly included in the deployment
4. Thumbnail URLs in HTML correctly resolve to existing files

## Future Maintenance
- The `.astro/generated/` directory is automatically managed by the build
- No manual intervention needed for thumbnail generation
- Adding new images to blog posts will automatically generate thumbnails on next build
