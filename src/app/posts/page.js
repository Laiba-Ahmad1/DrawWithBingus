import Client from "./client";
import { getCurrentUser } from '@/lib/getCurrentuser';

export default async function page()  {
const rawUser = await getCurrentUser();
  const user = rawUser ? JSON.parse(JSON.stringify(rawUser)) : null;
  return <Client user={user} />;
}
