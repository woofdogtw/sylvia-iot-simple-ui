# Changelog

## 0.1.4 - 2024-07-27

### Changed

- Add input validators for router components (WAN/LAN/wireless LAN).

## 0.1.3 - 2024-07-25

### Changed

- Add input validators for Sylvia-IoT core components.

### Fixed

- Clear list when data count API returns zero.
- Fix adding devices when no unit is selected.

## 0.1.2 - 2024-07-24

### Changed

- Display UI and service version.
- Refine dialog inputs by replacing disabled with read-only.
- Modify the coding style of Vue template property order.
- Port webpack to vite.
- Update dependencies.

## 0.1.1 - 2024-05-31

### Changed

- Update nginx to 1.26.1.
- Update dependencies.

### Fixed

- Fix DHCP leases dialog title.

## 0.1.0 - 2024-05-17

### Changed

- Update CI tools.
- Update dependencies.

## 0.0.3 - 2023-07-23

### Added

- Add GitHub Actions for releasing Docker images and GitHub Releases.

### Changed

- Update dependencies.
- Update to Sylvia-IoT Core v0.0.19.

### Fixed

- Add `scopes` in the `public/js/config.js` file.

## 0.0.2 - 2023-03-29

### Added

- Add Dockerfile.

### Changed

- Update dependencies.
- Move configurations from static `src/config.json` to `public/js/config.js` so that they can be applied for different environments without re-compiling.

## 0.0.1 - 2023-03-05

### Added

- The first release.
