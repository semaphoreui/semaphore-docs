# Migration from mdbook to Docusaurus

This document describes the migration from mdbook to Docusaurus that was completed on 2025-11-13.

## What Was Changed

### 1. **Documentation Structure**
- Migrated all markdown content from `src/` to `docs/`
- Converted `SUMMARY.md` (mdbook's table of contents) to `sidebars.ts` (Docusaurus configuration)
- Renamed `README.md` to `index.md` for the homepage

### 2. **Configuration Files**
- **Removed**: `book.toml` (mdbook configuration)
- **Added**: 
  - `docusaurus.config.ts` - Main Docusaurus configuration
  - `sidebars.ts` - Sidebar navigation configuration
  - `package.json` and `package-lock.json` - Node.js dependencies
  - `tsconfig.json` - TypeScript configuration

### 3. **Build System**
- **Old**: mdbook build system using Rust/Cargo
- **New**: Node.js/npm build system using Docusaurus
- Updated `build.sh` to use `npm run build`
- Updated `run.sh` to use `npm start` (development server)
- Updated Ansible build/deploy scripts in `deploy/roles/`

### 4. **Theme and Styling**
- Migrated custom CSS from `theme/` directory to `src/css/custom.css`
- Converted mdbook-specific styles to work with Docusaurus
- Removed mdbook-tabs functionality (converted to simple headers)

### 5. **Markdown Compatibility**
Fixed several MDX-specific issues:
- Converted self-closing HTML tags (`<br>`, `<hr>`, `<img>`) to proper MDX format (`<br/>`, `<hr/>`, `<img />`)
- Escaped placeholder tags like `<processname>`, `<random_string>` to avoid conflicts with JSX
- Converted HTML comments (`<!-- -->`) to JSX comments (`{/* */}`)
- Removed mdbook-specific syntax like `{{#tabs}}`, `{{#tab}}`, etc.
- Removed inline `style` attributes (not compatible with React/MDX)

### 6. **Build Output**
- **Old**: Output directory was `book/`
- **New**: Output directory is `build/`
- Updated deployment scripts to use the new `build/` directory

## How to Build

### Development Server
```bash
./run.sh
# or
npm start
```

This starts a local development server at http://localhost:3000 with hot reloading.

### Production Build
```bash
./build.sh
# or
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deployment
```bash
cd deploy
ansible-playbook build.yml  # Builds the site
# Then deploy as configured
```

## Known Issues

### Warnings (Non-Critical)

1. **Duplicate Routes**: There's a warning about duplicate routes at `/` because both the default homepage and docs index exist. This doesn't affect functionality but can be resolved by configuring Docusaurus to use the docs homepage as the site homepage.

2. **Broken Anchors**: Some internal anchor links may be broken due to Docusaurus generating different anchor IDs than mdbook. These should be reviewed and fixed in the content.

## Benefits of Docusaurus

1. **Modern Stack**: React-based, with a rich ecosystem of plugins
2. **Better Performance**: Optimized builds with code splitting
3. **Improved Search**: Better built-in search capabilities
4. **Versioning**: Native support for documentation versioning
5. **i18n**: Built-in internationalization support
6. **Responsive**: Mobile-friendly by default
7. **Active Development**: More actively maintained than mdbook

## Configuration Reference

### Site Configuration (`docusaurus.config.ts`)
- **URL**: https://semaphoreui.com
- **Base URL**: /
- **Google Analytics**: G-SXDFVHLVBM
- **Edit URL**: https://github.com/semaphoreui/semaphore-docs/edit/main/
- **Organization**: semaphoreui
- **Project**: semaphore-docs

### Sidebar Structure (`sidebars.ts`)
Three main sidebars:
1. `adminGuideSidebar` - Administration Guide
2. `userGuideSidebar` - User Guide
3. `faqSidebar` - FAQ

## Migration Checklist

- [x] Initialize Docusaurus project
- [x] Migrate all markdown content
- [x] Create sidebar configuration
- [x] Migrate custom theme/CSS
- [x] Update build scripts
- [x] Update deployment scripts
- [x] Fix MDX compatibility issues
- [x] Verify build succeeds
- [ ] Fix broken anchor links (optional)
- [ ] Resolve duplicate route warning (optional)
- [ ] Test all pages render correctly
- [ ] Update documentation about the new build process

## Rollback Instructions

If you need to rollback to mdbook:
1. The original mdbook configuration is preserved in `book.toml`
2. Original source files are in `src/` directory
3. Original theme files are in `theme/` directory
4. You would need to restore the original `build.sh` and `run.sh` scripts
5. Remove Docusaurus files: `rm -rf node_modules build .docusaurus package*.json tsconfig.json docusaurus.config.ts sidebars.ts`
