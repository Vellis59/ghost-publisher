# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-05-20

### Added
- Initial release of Ghost Publisher.
- **Settings Tab:** Configure Ghost Site URL and Admin API Key with connection testing.
- **Publishing Commands:**
    - Publish as Draft
    - Publish Now (Published)
    - Schedule (with Date/Time picker modal)
    - Update Existing Post
- **Pre-publish Checks:**
    - Dedicated sidebar view for content validation.
    - Checks for H1 headers, title resolution, content length, image URLs, and link safety.
- **Metadata Management:**
    - Automatic mapping of Ghost tags, excerpts, and featured images.
    - Frontmatter write-back for `post_id` and `status`.
- **Security:** JWT-based authentication for the Ghost Admin API.
