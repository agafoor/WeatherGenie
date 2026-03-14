-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_rooms ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Documents: all can read, admins can manage
CREATE POLICY "Authenticated users can view documents"
  ON public.documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert documents"
  ON public.documents FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update documents"
  ON public.documents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Document chunks: all can read (for RAG search)
CREATE POLICY "Authenticated users can view chunks"
  ON public.document_chunks FOR SELECT USING (auth.role() = 'authenticated');

-- Conversations: users manage own
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages: users manage messages in own conversations
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create messages"
  ON public.messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
  );

-- Genie rooms: all can read, admins can manage
CREATE POLICY "Authenticated users can view genie rooms"
  ON public.genie_rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert genie rooms"
  ON public.genie_rooms FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update genie rooms"
  ON public.genie_rooms FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete genie rooms"
  ON public.genie_rooms FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
