import ky from 'ky';

const customKy = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_HOST,
  credentials: "include",
  headers: { 'Content-Type': 'application/json' },
});

export default customKy;
