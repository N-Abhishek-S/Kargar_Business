---
feature: Video Testimonial Upload
date: 2026-07-21
---

## Observations
- Using `URL.createObjectURL(file)` is significantly superior for large files (videos) compared to reading them into Base64 `dataUrl`, which crashes the browser by consuming massive memory.
- Extending `public.reviews` with direct `video_url` columns instead of creating a one-to-one `review_videos` table prevented the need for complex joins and simplified frontend typing.
- The Admin Panel was extended from read-only to full-edit in order to support complete review lifecycle management including videos.

## Candidate Patterns
- **Direct Native File Handling**: Avoid Base64 encoding for any media over 5MB. Directly keep `File` in React State / react-hook-form.
- **Unified Cleanups**: Triggering `supabase.storage.remove()` from inside the mutation action (Admin Service) ensures no orphaned files are left over after deletes or replaces.

## Candidate Anti-Patterns
- **Base64 Payload Injection**: Encoding 100MB files into JSON payloads is a clear anti-pattern and guarantees failure on Edge Functions / mobile devices.
- **Over-normalization**: Creating separate tables for singular 1:1 optional data attributes (like a video per review). It adds friction without benefit.

## Promote To
- Core Framework Storage Standard (`standards/storage.md`): Mandate `File` object handling for media over 5MB.
- Core Framework Data Fetching (`blueprints/admin_edit_modal.json`): Turn the modal-based "full edit" component into a reusable blueprint for future entities.
