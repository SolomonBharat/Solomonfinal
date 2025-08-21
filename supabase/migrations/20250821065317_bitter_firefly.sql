@@ .. @@
 -- Create enum types for better data integrity
 DO $$ BEGIN
   CREATE TYPE rfq_status AS ENUM (
-    'pending_approval', 'approved', 'matched', 'closed', 'rejected'
+    'pending_approval', 'approved', 'matched', 'quoted', 'closed', 'rejected'
   );
 EXCEPTION
   WHEN duplicate_object THEN null;
 END $$;
 
 DO $$ BEGIN
   CREATE TYPE quotation_status AS ENUM (
-    'pending_review', 'approved', 'rejected', 'sent_to_buyer'
+    'pending_review', 'approved', 'rejected', 'sent_to_buyer', 'accepted'
   );
 EXCEPTION
   WHEN duplicate_object THEN null;
 END $$;