-- Create the company-assets bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true)
on conflict (id) do nothing;

-- Create policies for public access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'company-assets' );
