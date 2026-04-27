-- =========================================
-- PRE-REQUISITOS DE SCHEMA PARA INSERCOES
-- =========================================
ALTER TABLE public.learning_trails ADD COLUMN IF NOT EXISTS category_map JSONB DEFAULT '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS external_institution text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_labdiv BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
UPDATE public.profiles SET is_labdiv = true, role = 'user' WHERE role = 'labdiv';
UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role NOT IN ('user', 'moderator', 'admin');
UPDATE public.profiles SET role = 'moderator' WHERE role = 'moderador';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'moderator', 'admin'));
ALTER TABLE public.feedback_reports ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.feedback_reports ALTER COLUMN title DROP NOT NULL;

-- --- FILE: 20260307000001_seed_missing_disciplines.sql ---

-- Migrations: seed missing disciplines

INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('732017e2-992b-46f7-bd5f-98ff01514400', 'Probabilidade', '4300223', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('23a04a91-cc85-4e34-9717-820f71a4dfad', 'MecÃ¢nica QuÃ¢ntica AvanÃ§ada I', '4305001', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('dfbb6b0c-4142-4873-b986-9a79c4c6eff8', 'MecÃ¢nica QuÃ¢ntica AvanÃ§ada II', '4305002', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('38499359-c82c-496c-bbb6-3d4d2c09e43f', 'EletrodinÃ¢mi ca I', '4305003', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('b05fd886-e01b-49ff-b286-dce1d8c834dc', 'EletrodinÃ¢mi ca II', '4305004', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('0d76fc30-8dd6-4639-b346-acf0eed5fb7d', 'MecÃ¢nica ClÃ¡ssica', '4305005', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('4d977d13-e062-4f99-a513-87d4b84ca284', 'MecÃ¢nica EstatÃ­stica II', '4305006', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('cd22bb60-6d4b-45d7-aed5-3f4da92723e2', 'TÃ³picos avanÃ§ados em  tratamento estatÃ­stico de dados em fÃ­sica experimental', '4305103', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('1a63fb77-311d-44ab-afdd-493f1db8ddea', 'FÃ­sica de PartÃ­culas Eleme ntares', '4305106', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('a7894995-9795-419f-814c-5d2c4760df00', 'IntroduÃ§Ã£o Ã  Teoria QuÃ¢ntica de Camp os I', '4305107', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('ca6de039-b68b-4302-9953-bfdac258041d', 'FÃ­sica do Estado SÃ³ lido I', '4305110', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('59df1297-c852-4d31-9e98-c7bf18dec987', 'Microscopia de ForÃ§a AtÃ´mi ca e Tunelame nto', '4305205', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('ab2338a5-c19c-467f-a52b-e90ad25e4319', 'Simu laÃ§Ã£o Comp utacional de LÃ­quidos Moleculares e So luÃ§Ãµes', '4305216', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('4db0b290-2c24-4e20-aaac-7880118de9b5', 'IntroduÃ§Ã£o Ã  Teoria QuÃ¢ntica da Luz', '4305275', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('bd610e9e-f87d-4bec-ace6-b57b34401b1e', 'Cosmo logia FÃ­sica I', '4305292', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('d7696410-3ed7-49e1-905a-3667143f6990', 'Teoria QuÃ¢ntica de Muitos Corpos em  MatÃ©ria Condensada', '4305295', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('36d00fa9-d7ea-481b-8fce-526d96c2171f', 'Cosmo logia FÃ­sica II', '4305299', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('47f360a7-4111-4322-9709-cc7d64194c1b', 'IntroduÃ§Ã£o Ã  fÃ­sica de hÃ¡drons', '4305300', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('19920231-bcd5-41cf-ae2f-ce5942e623b7', 'Fenome nologia de ColisÃµes de Ã ons Pesados RelativÃ­sticos', '4305324', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('5aeed6b8-cf18-4e91-b773-8e42a0d61239', 'Sistema s DinÃ¢mi cos nÃ£o Lineares', '4305326', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('f15c953d-a9e0-4152-b4ff-c6edfbfefafd', 'Informa Ã§Ã£o QuÃ¢ntica e RuÃ­dos QuÃ¢nticos', '4305343', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('c1703519-7995-4478-af86-c92688497c3b', 'FenÃ´me nos Eme rgentes em  MatÃ©ria QuÃ¢ntica Correlacionada', '4305358', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('e11d972c-2729-4b8e-858f-23d77b8e26fc', 'MatÃ©ria QuÃ¢ntica TopolÃ³gica e seu desafio na fÃ­sica', '4305359', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('63dab033-c770-4619-9cf5-2db7f11c7809', 'Teoria do Funcional da Densidade: MolÃ©culas e SÃ³ lidos', '4305360', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('64a38cb4-7501-4b13-82e2-596c14f25d76', 'Processame nto de dispositivos em  sala limp a', '4305374', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('a6b75395-0748-481b-8196-04aa5e80a51b', 'Termo eletricidade e ma teriais quÃ¢nticos', '4305376', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('70e89c62-aeed-4bba-af78-26c12b026b5e', 'IntroduÃ§Ã£o Ã  Teoria QuÃ¢ntica de Camp os II', '4305828', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('19563216-42b4-46e6-be10-ff58e2cbe436', 'Eleme ntos de Mineralogia e Petrologia', 'GMG0630', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('97a769b1-c44d-4dd3-823e-d2465efea8b3', 'Fundame ntos de Oceanografia Fisica', 'IOF0201', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('359e21d8-28e9-4029-be50-19165115ed30', 'IntroduÃ§Ã£o Ã  DinÃ¢mi ca da Atmo sfera e dos Oceanos', 'IOF0210', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('fdf24eb5-e87d-478f-bac9-24a9f6b6a256', 'BioquÃ­mica e Biologia Molecular', 'QBQ0102', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('9c7929e0-dd7f-4362-95ab-2d1e4f14d546', 'BioquÃ­mica e Biologia Molecular', 'QBQ0104', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('5e98ab91-40a7-4c7b-a180-85f54d44e403', 'BioquÃ­mica', 'QBQ0106', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('bc85dc6f-9060-40ca-8553-38ac38e21c9e', 'BioquÃ­mica: Estrutura de Biomo lÃ©culas e Metabolismo', 'QBQ0116', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('089d37fb-2cda-417f-b1e1-019d081c076a', 'BioquÃ­mica: Estrutura de Biomo lÃ©culas e Metabolismo', 'QBQ0204', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('7a7d7911-81f7-4df7-9bca-64a9eda5f5f0', 'BioquÃ­mica', 'QBQ0313', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('81e1ae06-c579-4e67-bc45-9e9f25a5fc56', 'Biologia Molecular', 'QBQ0317', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('7e856e47-9677-48c1-87c9-4fedf0cd812d', 'BioquÃ­mica e Biologia Molecular: RealizaÃ§Ãµes e Perspectivas', 'QBQ2500', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('8ca74be8-d84f-4efd-ba70-1fb0ffaa2afe', 'Biologia Estrutural', 'QBQ2505', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('5b95767f-88eb-4778-8966-01dce02f7b19', 'BioquÃ­mica: Estrutura de Biomo lÃ©culas e Metabolismo', 'QBQ0230', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('91241ad0-4183-4d3b-9a7e-93f12933bbdf', 'BioquÃ­mica: Estrutura de Biomo lÃ©culas e Metabolismo', 'QBQ0250', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('9c5209f7-7b47-4aca-8e96-ee0383286688', 'BioquÃ­mica da NutriÃ§Ã£o', 'QBQ0314', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('7c6e601b-c6a4-4542-af2f-47f8c6f87c90', 'BioquÃ­mica MetabÃ³lica', 'QBQ1252', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('246e05b9-2d98-4cc4-8c9d-f1b95b8b7ae4', 'Tecnologia do Dna Recomb inante', 'QBQ2457', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('c485114c-173c-44f2-853d-aa82e4e7f25b', 'Biologia Molecular', 'QBQ1354', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('134bae9a-5a28-461a-bf78-3d7ab73c86ef', 'Enzimo logia', 'QBQ2502', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('20d28e8a-0621-4fcd-9620-5c29545b0349', 'ExpressÃ£o GÃªnica', 'QBQ2503', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('2283b342-af98-4c8b-ad03-a9e68fc8f59d', 'Biologia Molecular Comp utacional', 'QBQ2507', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('b6d9a216-8899-451a-b8b9-67a8f03519d4', 'Transporte e SinalizaÃ§Ã£o Celular', 'QBQ2508', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('7c91cdba-f9f4-4c3d-8ba2-5aaebfa7e282', 'BioquÃ­mica Redox', 'QBQ2509', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;

-- Migrations: update category map for existing

UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'b0f4f704-d14d-4a04-9f5e-39a6d420c2f9';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '81438ad1-1a6c-4bf7-9a80-ea729f7236cb';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'b33a97e8-2e70-4a7b-9a66-7dccbe4c9fe1';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'e0123a45-8e4c-4502-bca8-82c61f7577a2';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '7fcaf07f-734e-4156-be67-906fd4b9974f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f3e6ded1-1370-44a9-9d05-02e568a96cc3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f50fba42-faf3-4941-b0e2-f83cb2a43f57';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '921c9909-8899-440c-aa17-467ace6151af';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '9a731f29-e80c-4533-9071-798cde153c8d';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f3d32023-523d-46ae-8700-7931a6ac6292';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'b5d8d71b-7557-460e-9a32-7b2b2bfb4089';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'bc93e17b-f9b9-482c-8c77-d9baa018c0ca';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'a400fd8a-a27d-478c-9075-5d00cb1dde96';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3afc55b7-ce6c-45c4-8226-aeb864999cee';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'ea45aeba-1cc3-4c6a-8af3-0234fe9def1b';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '04e99c57-f9d6-460e-b6f5-449f3cd6ba2b';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'ebc8ebf4-9bf7-4a57-a64c-a04abd019a90';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'decfa858-a703-4bac-a791-00f675876c32';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '588c3799-d3e8-4cb6-b957-6a02bd37bb8b';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '1b7ff091-44dd-4a30-8e81-2a6060c128f7';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '1ef3cae8-b557-4dd3-900c-868d87e247ee';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f0c04c27-cc52-41d1-a4ca-29756e13496d';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '493b196b-7528-4d19-97fe-6945090085e8';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'aee11d25-a877-4547-88cd-6159e26bd290';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '773ecebc-2f27-4cad-b267-be284ad5a1e3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'fa56a33e-d550-400f-b874-f4d8c8177803';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'aa96ec7e-322b-442f-8136-059ffb04056c';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3a40ee68-afbc-40ea-823a-aa7df978fa98';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'fb84bc52-b4fa-40df-a74d-e4ad11f9bae5';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '60a0df60-4462-4529-8f28-e30076693cf7';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f98ee2c1-693a-44dd-80ac-4c69846a47a6';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '1085f287-90e5-4e26-8632-59a7a4c210b3';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'c2ace881-4604-405a-b1b8-b6f7312708b9';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f8b4816b-b93e-4ed5-bf2b-bb15c9f2af1f';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'c15a31e8-f22d-47d9-ad9d-7879893f0a13';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '27daaf19-dba6-498b-877b-b36d4476f3f3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '50158552-65b7-4c26-bb75-75e2d37ac06c';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '97405603-5a2f-4e70-8e8c-8a387da376ae';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '7e6841bb-1de3-4941-8f7e-5220a6f8b6aa';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '4e30ed39-2e2e-46db-9b6e-ed830e61e101';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '909f98d5-52d4-45aa-8687-c0bc5dbef786';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '4c6c80ab-2a20-46a6-ab98-f1d9fbb25038';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '50d2781e-dbc0-442c-bcb3-67455c0c49ff';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '283b620a-d34a-4e7a-99c5-69e6af8721e3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3577db0e-5c34-4444-b716-c5aadb60ab16';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '00020111-49c4-46c6-804c-64b3f3255e23';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0f3768e6-0828-41d4-a544-2a62ee3a298e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'd737b79e-4a23-41c1-b5b8-59899ac7a120';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '4bd5cd85-a730-4a17-9f82-dd58e267d950';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '4fc73e94-e441-4fc8-8cb6-117f403ac797';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'fff27b00-f3f4-4a33-98b7-676f2ff6d838';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '2e24860b-4e9b-43e6-b025-110fc986b399';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '998f0607-b78c-44be-b411-bb4bfe170b56';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '12d65378-8d5e-4dc6-aa47-41400999666e';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '5450766d-59ba-48e2-b1dc-9c2a6547116a';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '7dd22316-5194-4a01-93d8-68761eee766b';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'fb2ecff0-be2e-465e-ba82-f8c46774f707';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '6717d8c0-0448-4a9f-b991-42e63aaba801';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '42e79410-955b-41e9-8195-fe12d5336bba';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '5bb00e70-0292-46cb-9e96-7acc8932b844';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'e7ed68df-f9bc-4645-92d3-228a20e90c65';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '04749345-927d-4ece-9b0d-5d98d9a98921';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0f923164-aebb-4c12-8670-2cf2e775855b';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '60ab292b-f5b5-4eec-8d17-d3c390eb7f03';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'f0cb87f8-05c3-4938-864f-7f405becdd25';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '41872d6b-e51d-4927-8fcf-80b2725fc3b4';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'd511861a-620f-414e-8ceb-bee5d49a3269';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '73c36f5d-84cb-45d6-861e-006dec925814';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"eletiva"}'::jsonb WHERE id = '87e476bb-2c89-4888-8761-aaceeb38a21f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f90f3b85-d57e-4b51-8c20-007e6bcc783f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '080a7a5d-cb6d-49db-925e-0fc6aeb51a8d';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0779765e-85cc-43c7-911b-e9047d460cae';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '387aec65-da02-40e2-a5b1-1a61542f054e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3f1b8838-85a5-4117-a0c8-2ef35bc4051a';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'a1b94a10-4212-492b-8df6-13bc1586644e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '034767cb-0204-489f-adae-2213e5659dcc';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '76adec1d-1a96-4a07-b779-45caf4765fb1';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '2b989009-b002-490a-b2bd-136baf8e12db';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '9274d692-aa5f-4eff-b3dc-3052d13db7c4';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0fe287c2-b28a-4a43-bfae-453e3e80a340';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'bba5e513-bede-4822-a826-f742c243a16b';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '61e19475-01dc-4f7e-a1e6-2d45a3ee2f1f';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '1c17d876-d435-4a82-8660-7ceffe11f462';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '95a8139c-4c93-42a6-8ae7-35ca0a175213';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '356f90f5-0cb5-433f-8429-fb56ea1b5da1';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '13f2ac8d-f1d7-4a6d-a91e-b3cf62587e9b';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '31473107-ead3-4866-ae68-140c1769a6ce';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '3a2dcdb6-0a17-4ad5-a30f-5bd2a3db8317';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'd8f1e669-25c2-4b4d-94cd-0971e25b00b5';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '1e0fed4e-a277-46bc-b2ab-84c2d62158b1';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'de5646f3-713c-4889-8931-f7e14343b2be';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '1d915b72-f42b-4372-abad-e3517c1af19e';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '756db88d-4ec9-42ab-b702-2b710b32665a';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '74517ce2-db83-44ae-8ba5-a14a6434e554';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '2baed303-ea47-4e01-85ca-3e881cb79b5a';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'fb3c573d-8a01-4f55-9276-3e722cb974fd';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '5ee8114d-d73a-49d3-a8fd-5e5d7d59ece7';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '162f5ae5-f5cb-4f66-b2e6-1432df653a74';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'a0f42efc-3f9b-4874-a17a-49eff0b3a20e';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'be991f0b-56aa-437a-ae60-3d783c019677';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f4e437e4-1dcf-43ba-b767-ca3862de9a2e';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '2ea422ff-1633-44ca-b156-95a5480f3077';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '2ba9a206-90d3-42b7-a4d4-c39c696730b7';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'da9465e9-5112-4c18-b272-3683a8b67caf';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '980e8bd9-8f46-43a8-8959-3f5d055c9493';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '3f5724a1-3125-4a04-af02-ad72ed350fbd';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '68ddf705-67da-4a45-a83e-401bf9069f6d';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'd4d81f4f-a200-4224-ad38-6a55d2bc4838';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '1ff162da-d5b9-4f41-9610-07289e556efe';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '19d91e93-55c2-4994-ac90-c08fd64fedc5';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '4f39d98b-6cea-4951-a063-9b00f88de3d7';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '9ad57420-5fdc-4f58-8fb0-b1a9f5139f98';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '33831989-cecb-4cdd-beb5-a981e8c11792';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '8900236e-ed5e-4e13-824d-565aa5c42be8';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '471b77f1-37f6-40ff-9333-770963911eab';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '7f077512-1dd3-4a4f-bb64-aab9d0fd9b87';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0887a6ec-f891-4371-9472-cb60096ccf51';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '19b37c9a-9386-46c5-9626-8bc1f518a584';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '5c4f11f9-54af-46f1-b11b-c0062f41ec11';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'e74e0595-5f3c-4d48-92c9-c954bc1f2f51';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'aa034a80-bd28-442f-a8eb-cae03a7145dc';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3e81abf5-80d2-441e-b252-5031da1bf8c1';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '5dc1c1a8-2218-48b3-b31d-b130fb520552';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'c2c81e62-41c8-410f-b046-5597f2bb54e3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'ed3ad21b-6e98-41da-bbf6-8b6d313c2723';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '6ba888b3-2d53-4c9b-81c1-7d4b5cbefb7c';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'df17518a-caef-49b4-ab71-4d3e3540c836';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '260e4277-2506-49dc-b47b-0a1380766ea0';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'cf7be32d-6668-437a-98fa-614144d6e05b';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'de918dc9-be0c-41f0-824e-5ba417b804ca';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'a23541de-8390-4df7-82d0-1277217901be';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'e854aa86-ae80-40c5-a978-283ee01a482e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'abc9301a-9af8-406a-b6d1-e073cb834811';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '8c4e227d-27af-49e9-a02f-25a8fac708eb';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '26a48fcd-e170-4536-8e23-1656df0b01e8';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '04931e91-fedd-46f7-83cc-5598d7e68890';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '96614102-86ad-4bae-9974-748761728bc6';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '1e7309f8-e6f6-4ad9-bf80-215952833a6f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'c1a8942a-07f2-405c-af14-359dbf87af2e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'be6c2225-f132-49d5-b84e-92ae34d20889';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'ba6bd1d1-0397-4df9-9e35-f68c68bca404';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '7874848b-8254-4a1c-b484-819c251894a4';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '64098e6d-7a05-4817-8946-bf66f44785b7';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'baf156ff-7d4f-4049-a9d4-d6ef4f19cd5b';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'ea0d974a-e5fe-406b-b8af-922c39f18ca2';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'f003183e-4a23-46ad-babc-d44845f5a113';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '7812d2e4-e438-4bf4-806d-a2dc045a4cb5';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '73f9cb40-5b56-4744-b711-795c9f892681';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '686cb272-5fb7-428d-9709-1fe8aac09b3f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '3bffeb26-e09a-4acb-bcb3-0f0eda074fc5';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '8855da45-d34e-4833-9141-069a2b77979e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '5160cb26-0e9f-42b9-adbb-c363903f46cb';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '99fa5b90-9dc2-4646-87e0-3322c279b30f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '466f1ca5-fd52-44ca-9c18-d0e8fe584b4e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'adf6e898-62e5-423b-8c8d-8950f56fe620';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '2a564a90-0416-4689-8258-e88b5598fc34';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '3c294b76-68ed-4c91-a60f-cb36cdec8256';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '1e9cd3e8-8e27-4333-9cc3-35d60540538d';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '1ef00f42-8b6a-47f8-980c-0bc0a6b29058';

-- --- FILE: 20260306_emaranhamento_curricular_v3_2.sql ---

-- =============================================
-- EMARANHAMENTO CURRICULAR V3.2 â€” SCHEMA DDL
-- Data: 2026-03-06
-- =============================================

-- 1. Adicionar campo equivalence_group na tabela learning_trails
ALTER TABLE public.learning_trails 
ADD COLUMN IF NOT EXISTS equivalence_group TEXT DEFAULT NULL;

-- 2. Ãndice para buscas rÃ¡pidas por grupo de equivalÃªncia
CREATE INDEX IF NOT EXISTS idx_learning_trails_eq_group 
ON public.learning_trails(equivalence_group) WHERE equivalence_group IS NOT NULL;

-- 3. Tabela de ExclusÃµes MÃºtuas (LÃ³gica XOR)
CREATE TABLE IF NOT EXISTS public.equivalence_exclusions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_a TEXT NOT NULL,
    group_b TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.equivalence_exclusions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read equivalence_exclusions" ON public.equivalence_exclusions;
CREATE POLICY "Public read equivalence_exclusions" ON public.equivalence_exclusions 
FOR SELECT USING (true);

-- 4. Constraint UNIQUE em user_trail_progress para ON CONFLICT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_trail_progress_user_trail_unique'
    ) THEN
        ALTER TABLE public.user_trail_progress 
        ADD CONSTRAINT user_trail_progress_user_trail_unique UNIQUE (user_id, trail_id);
    END IF;
END $$;

-- 5. RPC para sincronizar progresso entre disciplinas equivalentes
CREATE OR REPLACE FUNCTION sync_equivalence_progress(p_user_id UUID, p_trail_id UUID)
RETURNS void AS $$
DECLARE
    v_group TEXT;
BEGIN
    SELECT equivalence_group INTO v_group FROM public.learning_trails WHERE id = p_trail_id;
    IF v_group IS NOT NULL THEN
        INSERT INTO public.user_trail_progress (user_id, trail_id, is_stable, updated_at)
        SELECT p_user_id, lt.id, true, now()
        FROM public.learning_trails lt
        WHERE lt.equivalence_group = v_group AND lt.id != p_trail_id
        ON CONFLICT (user_id, trail_id) DO UPDATE SET is_stable = true, updated_at = now();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MAPEAMENTO DE GRUPOS DE EQUIVALÃŠNCIA
-- =============================================

-- BLOCO A: Ciclo BÃ¡sico
UPDATE public.learning_trails SET equivalence_group = 'GRP_FISICA_1' WHERE course_code IN ('4302111', '4300151', '4300153');
UPDATE public.learning_trails SET equivalence_group = 'GRP_FISICA_2' WHERE course_code IN ('4302112', '4300159', '4300255');
UPDATE public.learning_trails SET equivalence_group = 'GRP_FISICA_3' WHERE course_code IN ('4302211', '4300270');
UPDATE public.learning_trails SET equivalence_group = 'GRP_FISICA_4' WHERE course_code IN ('4302212', '4300271');
UPDATE public.learning_trails SET equivalence_group = 'GRP_EXP_1' WHERE course_code IN ('4302113', '4300152');
UPDATE public.learning_trails SET equivalence_group = 'GRP_EXP_2' WHERE course_code IN ('4302114', '4300254');
UPDATE public.learning_trails SET equivalence_group = 'GRP_EXP_3' WHERE course_code IN ('4302213', '4300373');
UPDATE public.learning_trails SET equivalence_group = 'GRP_EXP_4' WHERE course_code IN ('4302214', '4300377');
UPDATE public.learning_trails SET equivalence_group = 'GRP_CALC_1' WHERE course_code IN ('MAT2453', 'MAT0105', 'MAT1351');
UPDATE public.learning_trails SET equivalence_group = 'GRP_CALC_2' WHERE course_code IN ('MAT2454', 'MAT1352');
UPDATE public.learning_trails SET equivalence_group = 'GRP_ALG_LIN' WHERE course_code IN ('MAT0122', 'MAT2351');

-- BLOCO B: AvanÃ§adas
UPDATE public.learning_trails SET equivalence_group = 'GRP_MQ_INTRO' WHERE course_code IN ('4302311', '4300371', '4302311_MED');
UPDATE public.learning_trails SET equivalence_group = 'GRP_MEC_CLASS' WHERE course_code IN ('4302305', '4300458', '4302305_MED');
UPDATE public.learning_trails SET equivalence_group = 'GRP_TERMO' WHERE course_code IN ('4302308', '4300259');
UPDATE public.learning_trails SET equivalence_group = 'GRP_ELETROMAG' WHERE course_code IN ('4302303', '4300372');
UPDATE public.learning_trails SET equivalence_group = 'GRP_ESTADO_SOLIDO' WHERE course_code IN ('4300402', '4300379');

-- ExclusÃµes MÃºtuas
INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
VALUES
('GRP_ESTADO_SOLIDO', 'GRP_ESTADO_SOLIDO', 'Disciplinas 4300402 (Bach) e 4300379 (Lic) sÃ£o equivalentes. CrÃ©ditos contados apenas uma vez.'),
('GRP_NUCLEAR_PART', 'GRP_NUCLEAR_PART', 'Disciplina 4300378 aparece nas duas grades. CrÃ©ditos contados apenas uma vez.')
ON CONFLICT DO NOTHING;

-- --- FILE: 20260306_gen4_pcc_xor_enforcement.sql ---

-- =============================================
-- GERAÃ‡ÃƒO IV: PCC VALIDATION + XOR ENFORCEMENT
-- Aplicado via MCP em 2026-03-06
-- =============================================

-- 1. Campo PCC
ALTER TABLE public.learning_trails 
ADD COLUMN IF NOT EXISTS requires_pcc_validation BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.learning_trails.requires_pcc_validation IS 
'Indica que a equivalÃªncia Bachâ†’Lic exige validaÃ§Ã£o de PrÃ¡ticas como Componente Curricular (PCC).';

UPDATE public.learning_trails SET requires_pcc_validation = true WHERE course_code IN (
    '4300356', '4300358', '4300390', 'EDM0425', 'EDM0426', '4300157', '4300415'
);

-- 2. RPC XOR Check
CREATE OR REPLACE FUNCTION public.check_xor_before_xp(
    p_user_id UUID,
    p_trail_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trail_code TEXT;
    v_trail_equiv TEXT;
    v_exclusion RECORD;
    v_conflicting_progress RECORD;
    v_result JSONB := '{"allowed": true}'::jsonb;
BEGIN
    SELECT course_code, equivalence_group INTO v_trail_code, v_trail_equiv
    FROM public.learning_trails WHERE id = p_trail_id;
    
    IF v_trail_code IS NULL THEN
        RETURN '{"allowed": false, "reason": "Trail not found"}'::jsonb;
    END IF;
    
    FOR v_exclusion IN 
        SELECT group_a, group_b, reason FROM public.equivalence_exclusions
        WHERE group_a = v_trail_code OR group_b = v_trail_code
           OR group_a = v_trail_equiv OR group_b = v_trail_equiv
    LOOP
        DECLARE
            v_other_key TEXT;
        BEGIN
            IF v_exclusion.group_a = v_trail_code OR v_exclusion.group_a = v_trail_equiv THEN
                v_other_key := v_exclusion.group_b;
            ELSE
                v_other_key := v_exclusion.group_a;
            END IF;
            
            SELECT utp.trail_id, lt.course_code, lt.title
            INTO v_conflicting_progress
            FROM public.user_trail_progress utp
            JOIN public.learning_trails lt ON lt.id = utp.trail_id
            WHERE utp.user_id = p_user_id
              AND utp.is_stable = true
              AND (lt.course_code = v_other_key OR lt.equivalence_group = v_other_key)
            LIMIT 1;
            
            IF v_conflicting_progress IS NOT NULL THEN
                v_result := jsonb_build_object(
                    'allowed', false,
                    'reason', 'XOR_EXCLUSION',
                    'conflicting_trail', v_conflicting_progress.title,
                    'conflicting_code', v_conflicting_progress.course_code,
                    'exclusion_reason', v_exclusion.reason
                );
                RETURN v_result;
            END IF;
        END;
    END LOOP;
    
    RETURN v_result;
END;
$$;

-- --- FILE: 20260306_gen4_titles_equivalences.sql ---

-- =============================================
-- GERAÃ‡ÃƒO IV: CORREÃ‡ÃƒO DE TÃTULOS INCORRETOS  
-- Aplicado via MCP em 2026-03-06
-- =============================================

UPDATE public.learning_trails SET title = 'IntroduÃ§Ã£o Ã  TermodinÃ¢mica' WHERE course_code = '4300208' AND axis = 'bach';
UPDATE public.learning_trails SET title = 'IntroduÃ§Ã£o Ã  FÃ­sica Computacional' WHERE course_code = '4300218' AND axis = 'bach';
UPDATE public.learning_trails SET title = 'Geometria AnalÃ­tica' WHERE course_code = 'MAT0105';
UPDATE public.learning_trails SET title = 'CÃ¡lculo para FunÃ§Ãµes de Uma VariÃ¡vel Real I' WHERE course_code = 'MAT1351';
UPDATE public.learning_trails SET title = 'CÃ¡lculo para FunÃ§Ãµes de Uma VariÃ¡vel Real II' WHERE course_code = 'MAT1352';
UPDATE public.learning_trails SET title = 'CÃ¡lculo para FunÃ§Ãµes de VÃ¡rias VariÃ¡veis I' WHERE course_code = 'MAT2351';
UPDATE public.learning_trails SET title = 'CÃ¡lculo para FunÃ§Ãµes de VÃ¡rias VariÃ¡veis II' WHERE course_code = 'MAT2352';
UPDATE public.learning_trails SET title = 'Equipamentos MÃ©dico-Hospitalares I' WHERE course_code = 'MDR0636';
UPDATE public.learning_trails SET title = 'Projetos â€“ ATPA', category = 'obrigatoria', excitation_level = 7 WHERE course_code = '4300415' AND axis = 'lic';

-- =============================================
-- EQUIVALÃŠNCIAS N-PARA-1
-- =============================================

UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS1' WHERE course_code IN ('4302111', '4300151', '4300153');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS2' WHERE course_code IN ('4302112', '4300159', '4300357');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS3' WHERE course_code IN ('4302211', '4300270', '4300271');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS4' WHERE course_code IN ('4302212', '4300160', '4300372', '4300374');
UPDATE public.learning_trails SET equivalence_group = 'EQ_QUANT' WHERE course_code IN ('4302311', '4300371');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP1' WHERE course_code IN ('4302113', '4300152', '4300254');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP3' WHERE course_code IN ('4302213', '4300373');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP5' WHERE course_code IN ('4302313', '4300377');

-- EXCLUSÃ•ES MÃšTUAS XOR
INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
SELECT 'AGA0416', '4300430', 'SobreposiÃ§Ã£o: Cosmologia (IAG vs IF)'
WHERE NOT EXISTS (SELECT 1 FROM public.equivalence_exclusions WHERE group_a = 'AGA0416' AND group_b = '4300430');

INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
SELECT 'AGA0319', '4300374', 'SobreposiÃ§Ã£o: Relatividade Geral (IAG vs Lic)'
WHERE NOT EXISTS (SELECT 1 FROM public.equivalence_exclusions WHERE group_a = 'AGA0319' AND group_b = '4300374');

-- =============================================
-- CORREÃ‡ÃƒO DE PRÃ‰-REQUISITOS
-- =============================================

-- Bacharelado
UPDATE public.learning_trails SET prerequisites = '{4302111}', excitation_level = 2 WHERE course_code = '4300208' AND axis = 'bach';
UPDATE public.learning_trails SET prerequisites = '{4302111}', excitation_level = 2 WHERE course_code = '4300218' AND axis = 'bach';
UPDATE public.learning_trails SET prerequisites = '{4302112, 4300208, MAT2454}' WHERE course_code = '4302401';
UPDATE public.learning_trails SET prerequisites = '{4300218, MAT2453}' WHERE course_code = 'MAP0214' AND axis = 'comum';

-- Licenciatura
UPDATE public.learning_trails SET prerequisites = '{4300156, 4300157}' WHERE course_code = '4300356';
UPDATE public.learning_trails SET prerequisites = '{4300271, MAT2351, 4300160, MAT0105}' WHERE course_code = '4300372';
UPDATE public.learning_trails SET prerequisites = '{4300357, MAT2352}' WHERE course_code = '4300458';
UPDATE public.learning_trails SET prerequisites = '{MAT1351}' WHERE course_code = '4300270';
UPDATE public.learning_trails SET prerequisites = '{4300153, 4300156}' WHERE course_code = '4300374';
UPDATE public.learning_trails SET prerequisites = '{4300390}' WHERE course_code = 'EDM0425';
UPDATE public.learning_trails SET prerequisites = '{4300377}' WHERE course_code = '4300371';
UPDATE public.learning_trails SET prerequisites = '{MAT1351, 4300153}' WHERE course_code = '4300255';
UPDATE public.learning_trails SET prerequisites = '{4300159, MAT1352}' WHERE course_code = '4300259';

-- FÃ­sica MÃ©dica
UPDATE public.learning_trails SET prerequisites = '{MDR0633}' WHERE course_code = 'MDR0636';
UPDATE public.learning_trails SET prerequisites = '{4300437, MDR0636}' WHERE course_code = 'MDR0642';
UPDATE public.learning_trails SET prerequisites = '{4302303, MDR0636, MDR0639}' WHERE course_code = 'MDR0643';
UPDATE public.learning_trails SET prerequisites = '{MDR0635, MDR0637}' WHERE course_code = 'MDR0645';
UPDATE public.learning_trails SET prerequisites = '{MAT0216, MDR0634}' WHERE course_code = 'MDR0646';
UPDATE public.learning_trails SET prerequisites = '{MDR0644}' WHERE course_code = 'MDR0647';

-- --- FILE: 20260306_upgrade_user_progress.sql ---

-- Create enum for trail progress status
DO $$ BEGIN
    CREATE TYPE trail_status AS ENUM ('cursando', 'concluida');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to user_trail_progress
ALTER TABLE public.user_trail_progress 
ADD COLUMN IF NOT EXISTS status trail_status;

-- Update RLS for user_trail_progress if not already set robustly
-- (Assuming standard profile-based RLS is active)

-- Optimization index for the horizontal feed
CREATE INDEX IF NOT EXISTS idx_user_trail_progress_status ON public.user_trail_progress (user_id, status);

-- RPC for toggling progress (To avoid complex client-side logic)
CREATE OR REPLACE FUNCTION toggle_trail_status(p_trail_id UUID, p_status trail_status)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    INSERT INTO public.user_trail_progress (user_id, trail_id, status, updated_at)
    VALUES (v_user_id, p_trail_id, p_status, now())
    ON CONFLICT (user_id, trail_id) 
    DO UPDATE SET 
        status = CASE 
            WHEN user_trail_progress.status = p_status THEN NULL 
            ELSE p_status 
        END,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- FILE: 20260306_completed_trails.sql ---

-- Protocolo SÃ­ncrotron v3: Persistent Tracker
-- Tabela para armazenar quais trilhas (disciplinas) o usuÃ¡rio jÃ¡ concluiu de fato.

CREATE TABLE IF NOT EXISTS public.user_completed_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trail_id UUID NOT NULL REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, trail_id)
);

-- Ativar RLS
ALTER TABLE public.user_completed_trails ENABLE ROW LEVEL SECURITY;

-- PolÃ­ticas de SeguranÃ§a
DROP POLICY IF EXISTS "Users can manage their own completed trails" ON public.user_completed_trails;
CREATE POLICY "Users can manage their own completed trails"
ON public.user_completed_trails
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- FunÃ§Ã£o RPC para Toggle AtÃ´mico
-- Retorna TRUE se agora estÃ¡ concluÃ­da, FALSE se foi removida.
CREATE OR REPLACE FUNCTION public.toggle_trail_completion(field_trail_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_exists BOOLEAN;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'NÃ£o autenticado';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.user_completed_trails 
        WHERE user_id = v_user_id AND trail_id = field_trail_id
    ) INTO v_exists;

    IF v_exists THEN
        DELETE FROM public.user_completed_trails 
        WHERE user_id = v_user_id AND trail_id = field_trail_id;
        RETURN FALSE;
    ELSE
        INSERT INTO public.user_completed_trails (user_id, trail_id)
        VALUES (v_user_id, field_trail_id);
        RETURN TRUE;
    END IF;
END;
$$;

-- --- FILE: 20260306_add_quiz_to_submissions.sql ---

-- Migration: Add quiz column to submissions and track responses
-- Created: 2026-03-06

-- 1. Add quiz column
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS quiz JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.submissions.quiz IS 'Mini quiz for the post. Array of objects {id, question, options[], correct_option}';

-- 2. Create tracking table for responses
CREATE TABLE IF NOT EXISTS public.submission_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

-- 3. Enable RLS
ALTER TABLE public.submission_quiz_responses ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Users can view own quiz responses" ON public.submission_quiz_responses;
DROP POLICY IF EXISTS "Users can view own quiz responses" ON public.submission_quiz_responses;
CREATE POLICY "Users can view own quiz responses" ON public.submission_quiz_responses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz responses" ON public.submission_quiz_responses;
DROP POLICY IF EXISTS "Users can insert own quiz responses" ON public.submission_quiz_responses;
CREATE POLICY "Users can insert own quiz responses" ON public.submission_quiz_responses
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_submission ON public.submission_quiz_responses(submission_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user ON public.submission_quiz_responses(user_id);



-- Migration: GovernanÃ§a e PapÃ©is v1
-- Adiciona flags de Membro Lab-Div e Visibilidade, e ajusta restriÃ§Ãµes de Role.

-- 1. Adicionar novas colunas se nÃ£o existirem
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_labdiv BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. Migrar papel 'labdiv' legado para a nova flag
-- Todos que eram 'labdiv' agora sÃ£o 'user' com a flag is_labdiv = true
UPDATE public.profiles 
SET is_labdiv = true, role = 'user' 
WHERE role = 'labdiv';

-- 3. Garantir que todos tenham um papel vÃ¡lido (fallback para 'user')
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('user', 'moderator', 'admin');

-- 4. Atualizar restriÃ§Ã£o de CHECK para os papÃ©is permitidos
-- Nota: Se o constraint tiver outro nome, o drop pode falhar, mas o add garantirÃ¡ a nova regra.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'moderator', 'admin'));

-- 5. ComentÃ¡rios para documentaÃ§Ã£o
COMMENT ON COLUMN public.profiles.is_labdiv IS 'Indica se o usuÃ¡rio Ã© um membro oficial do Lab-Div (recurso de governanÃ§a).';
COMMENT ON COLUMN public.profiles.is_visible IS 'Controla se o perfil Ã© visÃ­vel publicamente na plataforma (ajustÃ¡vel por Admins).';

-- (Role update already handled)

-- Migration: Fix Role Constraints and Sync
-- Ensures 'moderator' and 'moderador' are both accepted or standardized.
-- We will standardize on 'moderator' (English) as per types/index.ts.

-- 1. Update any existing 'moderador' to 'moderator'
UPDATE public.profiles SET role = 'moderator' WHERE role = 'moderador';

-- 2. Update check constraint to be more robust
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'moderator', 'admin'));

-- --- FILE: 20260308_fix_feedback_rls.sql ---

-- Migration: Fix Feedback Reports RLS
-- Allows anyone to insert feedback and makes title optional for quick reporting.

-- 1. Ensure 'title' isn't required (current UI only uses description)
ALTER TABLE public.feedback_reports ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.feedback_reports ALTER COLUMN title DROP NOT NULL;

-- 2. Relax RLS to allow anonymous inserts
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback_reports;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback_reports;
CREATE POLICY "Anyone can insert feedback" ON public.feedback_reports 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 3. Ensure admins can manage everything
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback_reports;
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback_reports;
CREATE POLICY "Admins can manage all feedback" ON public.feedback_reports 
FOR ALL 
TO authenticated 
USING (is_admin());

-- --- FILE: 20260306_create_nuclear_reset_v4.sql ---

-- Migration: 20260306_create_nuclear_reset_v4.sql
-- Description: Cria a funÃ§Ã£o RPC nuclear_reset_v4 para limpar todas as tabelas e perfis de usuÃ¡rios, apagando todo o conteÃºdo do site.

CREATE OR REPLACE FUNCTION public.nuclear_reset_v4()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Trunca as tabelas principais. O CASCADE garante que tabelas com chaves estrangeiras que dependem destas tambÃ©m sejam limpas (ex: comentÃ¡rios, curtidas, etc).
  -- A tabela auth.users nÃ£o pode ser truncada diretamente por aqui facilmente devido a FKs e limitaÃ§Ãµes do Supabase Auth.
  -- Perfis e conteÃºdo pÃºblico:
  
  TRUNCATE TABLE public.profiles CASCADE;
  TRUNCATE TABLE public.submissions CASCADE;
  TRUNCATE TABLE public.perguntas CASCADE;
  TRUNCATE TABLE public.messages CASCADE;
  TRUNCATE TABLE public.entanglement_messages CASCADE;
  TRUNCATE TABLE public.learning_trails CASCADE;
  TRUNCATE TABLE public.collections CASCADE;
  TRUNCATE TABLE public.reports CASCADE;
  TRUNCATE TABLE public.feedback_reports CASCADE;
  TRUNCATE TABLE public.notifications CASCADE;
  TRUNCATE TABLE public.quiz_attempts CASCADE;
  TRUNCATE TABLE public.reading_history CASCADE;
  TRUNCATE TABLE public.analytics_plays CASCADE;

  -- Remove usuÃ¡rios do auth.users (isso cascateia para auth.identities, auth.sessions, etc)
  -- NOTA: O auth.users requer privilÃ©gios de superuser que a role postgres do Supabase geralmente tem no dashboard/migrations,
  -- mas pode falhar dependendo da role que chama o RPC se nÃ£o for a correta, por isso usamos SECURITY DEFINER (roda como o criador, usualmente o superuser da migration).
  DELETE FROM auth.users;

END;
$$;

-- --- EXTRA: profile_customization ---
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS use_nickname BOOLEAN DEFAULT false;
COMMENT ON COLUMN public.profiles.use_nickname IS 'Se verdadeiro, o sistema exibirÃ¡ o username/apelido em vez do full_name em todo o Hub.';


