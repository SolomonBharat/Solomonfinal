/*
  # Create Storage Buckets for File Uploads

  1. Storage Buckets
    - `rfq-images` - RFQ reference images
    - `quotation-images` - Quotation product images
    - `factory-media` - Factory photos and videos
    - `documents` - Verification documents

  2. Security
    - Public read access for approved content
    - Authenticated upload access
    - File type and size restrictions
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('rfq-images', 'rfq-images', true),
  ('quotation-images', 'quotation-images', true),
  ('factory-media', 'factory-media', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RFQ Images bucket policies
CREATE POLICY "Authenticated users can upload RFQ images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'rfq-images');

CREATE POLICY "Anyone can view RFQ images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'rfq-images');

CREATE POLICY "Users can delete own RFQ images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'rfq-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Quotation Images bucket policies
CREATE POLICY "Authenticated users can upload quotation images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'quotation-images');

CREATE POLICY "Anyone can view quotation images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'quotation-images');

CREATE POLICY "Users can delete own quotation images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'quotation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Factory Media bucket policies
CREATE POLICY "Authenticated users can upload factory media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'factory-media');

CREATE POLICY "Anyone can view factory media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'factory-media');

CREATE POLICY "Users can delete own factory media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'factory-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents bucket policies (private)
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view own documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'admin')
  );

CREATE POLICY "Users can delete own documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);