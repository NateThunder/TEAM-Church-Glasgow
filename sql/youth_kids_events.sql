-- Data-only event entries for Kids Holiday Cafe, Youth Scrabble Club, and picnic copy.
-- This does not change the database schema.

update events
set
  description = 'The Team Church picnic is always full of life: food, laughter, games, fellowship, and time together as one church family. Come ready for a lively day outdoors with friends old and new.'
where title = 'Church Picnic'
  and start = '2026-07-11T08:00:00+00:00';

-- Cleanup: remove existing Kids Holiday Cafe rows in this programme window before reinserting weekdays.
delete from events
where title = 'Kids Holiday Cafe'
  and start >= '2026-07-07T00:00:00+00:00'
  and start < '2026-08-07T00:00:00+00:00';

insert into events (title, description, category, location, start, "end", image_url)
select
  'Kids Holiday Cafe',
  'The Everlasting Foodbank Kids Holiday Cafe runs from 7 July to 6 August 2026 for children aged 5-12. Registration is still ongoing and it is not too late to register your child. Children can enjoy games, crafts, music, creativity, play, learning, laughter, and new friends. Free, sponsored by Glasgow City Council. Book in advance by emailing info.theeverlastingfoodbank@gmail.com.',
  'Kids',
  '12 Whitehill Street, Glasgow G31 2LJ',
  cafe_day + time '10:00',
  cafe_day + time '15:00',
  null
from generate_series(
  date '2026-07-07',
  date '2026-08-06',
  interval '1 day'
) as cafe_days(cafe_day)
where extract(isodow from cafe_day) between 1 and 5
  and not exists (
    select 1 from events
    where title = 'Kids Holiday Cafe'
      and start = cafe_day + time '10:00'
  );

insert into events (title, description, category, location, start, "end", image_url)
select
  'Youth Scrabble Club',
  'Youth Scrabble Club has started with a bang. Young Scrabbucionados meet every alternate Saturday to play, learn, grow, improve vocabulary, boost critical thinking, build confidence, and make new friends. For ages 7-15. Contact +447440020115.',
  'Youth',
  '12 Whitehill Street, Glasgow G31 2LJ',
  occurrence_start,
  occurrence_end,
  null
from (
  values
    ('2026-07-04T16:00:00+01:00'::timestamptz, '2026-07-04T18:00:00+01:00'::timestamptz),
    ('2026-07-18T16:00:00+01:00'::timestamptz, '2026-07-18T18:00:00+01:00'::timestamptz),
    ('2026-08-01T16:00:00+01:00'::timestamptz, '2026-08-01T18:00:00+01:00'::timestamptz),
    ('2026-08-15T16:00:00+01:00'::timestamptz, '2026-08-15T18:00:00+01:00'::timestamptz),
    ('2026-08-29T16:00:00+01:00'::timestamptz, '2026-08-29T18:00:00+01:00'::timestamptz),
    ('2026-09-12T16:00:00+01:00'::timestamptz, '2026-09-12T18:00:00+01:00'::timestamptz),
    ('2026-09-26T16:00:00+01:00'::timestamptz, '2026-09-26T18:00:00+01:00'::timestamptz),
    ('2026-10-10T16:00:00+01:00'::timestamptz, '2026-10-10T18:00:00+01:00'::timestamptz),
    ('2026-10-24T16:00:00+01:00'::timestamptz, '2026-10-24T18:00:00+01:00'::timestamptz),
    ('2026-11-07T16:00:00+00:00'::timestamptz, '2026-11-07T18:00:00+00:00'::timestamptz),
    ('2026-11-21T16:00:00+00:00'::timestamptz, '2026-11-21T18:00:00+00:00'::timestamptz),
    ('2026-12-05T16:00:00+00:00'::timestamptz, '2026-12-05T18:00:00+00:00'::timestamptz),
    ('2026-12-19T16:00:00+00:00'::timestamptz, '2026-12-19T18:00:00+00:00'::timestamptz)
) as scrabble_events(occurrence_start, occurrence_end)
where not exists (
  select 1 from events
  where title = 'Youth Scrabble Club'
    and start = occurrence_start
);
