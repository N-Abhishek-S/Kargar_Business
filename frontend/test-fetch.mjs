const url = "https://gufwdccyiqryisyzravk.supabase.co/storage/v1/object/public/review-images/profile-images/2026-07-16/94c2f9aa-2f02-4237-9537-92828f3bb7b4.jpg";

fetch(url, { method: 'HEAD' }).then(res => console.log('Status:', res.status)).catch(err => console.error(err));
