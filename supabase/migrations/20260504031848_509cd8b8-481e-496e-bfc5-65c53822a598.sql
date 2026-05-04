-- Drop user-controlled insert policy on rewards
DROP POLICY IF EXISTS "Users can insert their own rewards" ON public.rewards;

-- Server-side badge awarder: computes earned badges from topics and inserts any missing ones for the caller
CREATE OR REPLACE FUNCTION public.award_earned_badges()
RETURNS SETOF public.rewards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  completed_count int;
  total_count int;
  half_count int;
  badge record;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE is_completed = true),
    COUNT(*)
  INTO completed_count, total_count
  FROM public.topics
  WHERE user_id = uid;

  IF total_count = 0 THEN
    RETURN;
  END IF;

  half_count := CEIL(total_count::numeric / 2);

  FOR badge IN
    SELECT * FROM (VALUES
      ('First Step',        '🚀', 'Completed your first topic!',        1),
      ('Beginner Star',     '⭐', 'Completed 3 topics',                  3),
      ('Consistency Badge', '🔥', 'Completed 5 topics',                  5),
      ('Halfway Hero',      '🏆', 'Completed half your path!',           half_count),
      ('Path Master',       '👑', 'Completed your entire learning path!', total_count)
    ) AS t(name, icon, descr, threshold)
  LOOP
    IF completed_count >= badge.threshold THEN
      INSERT INTO public.rewards (user_id, badge_name, badge_icon, description)
      SELECT uid, badge.name, badge.icon, badge.descr
      WHERE NOT EXISTS (
        SELECT 1 FROM public.rewards
        WHERE user_id = uid AND badge_name = badge.name
      );
    END IF;
  END LOOP;

  RETURN QUERY SELECT * FROM public.rewards WHERE user_id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.award_earned_badges() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_earned_badges() TO authenticated;