-- Iserisce un profilo per tutti gli utenti esistenti in auth.users
-- che non hanno ancora un profilo in public.profiles.

insert into public.profiles (id, username)
select 
  id, 
  coalesce(raw_user_meta_data ->> 'username', split_part(email, '@', 1)) as username
from auth.users
where id not in (select id from public.profiles);
