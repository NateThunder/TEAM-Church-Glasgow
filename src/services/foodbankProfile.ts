import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export type FoodbankProfile = {
  id?: string
  profileKey: string
  heroImageUrl: string
  heroKicker: string
  heroTitle: string
  heroSummary: string
  missionTitle: string
  missionBody: string
  committeeTitle: string
  committeeSummary: string
  committeeMembers: string
  committeeUrl: string
  supportTitle: string
  supportIntro: string
  supportRoleStatus: string
  supportJoinDetails: string
  supportLocationDetails: string
  supportOpeningDetails: string
  helpSummary: string
  hoursPrimaryLabel: string
  hoursPrimaryValue: string
  hoursSecondaryLabel: string
  hoursSecondaryValue: string
  address: string
  directionsUrl: string
  phone: string
  email: string
  donationSummary: string
  itemDonationDetails: string
  charityName: string
  charityNumber: string
  websiteUrl: string
  supportUrl: string
  donateUrl: string
  contactUrl: string
  aboutUrl: string
  facebookUrl: string
  isActive: boolean
}

export type FoodbankProfileRow = {
  id: string
  profile_key: string
  hero_image_url: string | null
  hero_kicker: string | null
  hero_title: string | null
  hero_summary: string | null
  mission_title: string | null
  mission_body: string | null
  committee_title: string | null
  committee_summary: string | null
  committee_members: string | null
  committee_url: string | null
  support_title: string | null
  support_intro: string | null
  support_role_status: string | null
  support_join_details: string | null
  support_location_details: string | null
  support_opening_details: string | null
  help_summary: string | null
  hours_primary_label: string | null
  hours_primary_value: string | null
  hours_secondary_label: string | null
  hours_secondary_value: string | null
  address: string | null
  directions_url: string | null
  phone: string | null
  email: string | null
  donation_summary: string | null
  item_donation_details: string | null
  charity_name: string | null
  charity_number: string | null
  website_url: string | null
  support_url: string | null
  donate_url: string | null
  contact_url: string | null
  about_url: string | null
  facebook_url: string | null
  is_active: boolean
}

export const FOODBANK_PROFILE_SELECT = [
  'id',
  'profile_key',
  'hero_image_url',
  'hero_kicker',
  'hero_title',
  'hero_summary',
  'mission_title',
  'mission_body',
  'committee_title',
  'committee_summary',
  'committee_members',
  'committee_url',
  'support_title',
  'support_intro',
  'support_role_status',
  'support_join_details',
  'support_location_details',
  'support_opening_details',
  'help_summary',
  'hours_primary_label',
  'hours_primary_value',
  'hours_secondary_label',
  'hours_secondary_value',
  'address',
  'directions_url',
  'phone',
  'email',
  'donation_summary',
  'item_donation_details',
  'charity_name',
  'charity_number',
  'website_url',
  'support_url',
  'donate_url',
  'contact_url',
  'about_url',
  'facebook_url',
  'is_active',
].join(',')

export const DEFAULT_FOODBANK_PROFILE: FoodbankProfile = {
  profileKey: 'default-foodbank',
  heroImageUrl: '/foodbank/foodbank%20banner.png',
  heroKicker: 'OUR FOODBANK',
  heroTitle: 'Everlasting Foodbank',
  heroSummary:
    'Our foodbank serves Dennistoun and beyond with practical food support, encouragement, and a warm welcome.',
  missionTitle: 'Mission and history',
  missionBody:
    'The Everlasting Foodbank SCIO was founded in Glasgow in 2014 by the treasurer and Pastor of Everlasting Arms Ministries Church in Dennistoun. The Everlasting Foodbank is a Christian organisation that serves the community of Dennistoun and beyond by providing food to those in need. Although we are a foodbank, we believe that "man cannot live by bread alone" (Matthew 4:4). Our goal is not just to feed people for a day, but to give them the confidence and encouragement they need to prosper every day.',
  committeeTitle: 'Meet the committee',
  committeeSummary:
    'The Foodbank committee helps guide the work, steward donations, and support the practical running of the charity.',
  committeeMembers:
    'Yinka Ogunnoiki | Treasurer | /foodbank/pastor.png\nTolani Hassan | Chairman | /foodbank/auntie%20t.png\nUnoma Okudo | Financial Secretary | /foodbank/unoma.png\nTemilolu Agbede | Assistant Secretary | /foodbank/temi.png\nAnnet Conde | Secretary | /foodbank/annet.png',
  committeeUrl: 'https://www.everlastingfoodbank.org/blank',
  supportTitle: 'Volunteer and support',
  supportIntro:
    'Join the team by volunteering, donating food, or giving financially to help the Foodbank serve local people week by week.',
  supportRoleStatus:
    'There are currently no paid job positions available, but volunteer help is welcome.',
  supportJoinDetails:
    'You can get involved by volunteering time, donating food and essentials, or supporting the Foodbank financially.',
  supportLocationDetails:
    'The Foodbank operates from 12 Whitehill Street, Glasgow G31 2LH.',
  supportOpeningDetails:
    'The Foodbank opens on Saturdays, with extended hours on first and third Saturdays. Contact the team before visiting if you need current details.',
  helpSummary:
    'If you need food support, come during the opening times below or contact the Foodbank team directly before visiting.',
  hoursPrimaryLabel: 'First and third Saturdays',
  hoursPrimaryValue: '1:00 PM - 3:00 PM',
  hoursSecondaryLabel: 'Other Saturdays',
  hoursSecondaryValue: '1:00 PM - 2:00 PM',
  address: '12 Whitehill Street, Glasgow G31 2LH',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=12+Whitehill+Street,+Glasgow+G31+2LH',
  phone: '07983021283',
  email: 'contact@everlastingfoodbank.org',
  donationSummary:
    'Support the Foodbank financially, volunteer your time, or help restock essentials for local families.',
  itemDonationDetails:
    'Food, clothes and toiletries can be donated directly on Saturdays 12:00 PM - 3:00 PM and Sundays 9:00 AM - 1:30 PM.',
  charityName: 'The Everlasting Foodbank SCIO',
  charityNumber: 'SC047458',
  websiteUrl: 'https://www.everlastingfoodbank.org/',
  supportUrl: 'https://www.everlastingfoodbank.org/support-us',
  donateUrl: 'https://www.everlastingfoodbank.org/donate',
  contactUrl: 'https://www.everlastingfoodbank.org/contact-us',
  aboutUrl: 'https://www.everlastingfoodbank.org/about',
  facebookUrl: 'https://www.facebook.com/everlastingfoodbank',
  isActive: true,
}

export type FoodbankProfilePayload = {
  profile_key: string
  hero_image_url: string
  hero_kicker: string
  hero_title: string
  hero_summary: string
  mission_title: string
  mission_body: string
  committee_title: string
  committee_summary: string
  committee_members: string
  committee_url: string
  support_title: string
  support_intro: string
  support_role_status: string
  support_join_details: string
  support_location_details: string
  support_opening_details: string
  help_summary: string
  hours_primary_label: string
  hours_primary_value: string
  hours_secondary_label: string
  hours_secondary_value: string
  address: string
  directions_url: string
  phone: string
  email: string
  donation_summary: string
  item_donation_details: string
  charity_name: string
  charity_number: string
  website_url: string
  support_url: string
  donate_url: string
  contact_url: string
  about_url: string
  facebook_url: string
  is_active: boolean
}

const fallbackText = (value: string | null | undefined, fallback: string) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export const toFoodbankProfile = (row: FoodbankProfileRow): FoodbankProfile => ({
  id: row.id,
  profileKey: fallbackText(row.profile_key, DEFAULT_FOODBANK_PROFILE.profileKey),
  heroImageUrl: fallbackText(row.hero_image_url, DEFAULT_FOODBANK_PROFILE.heroImageUrl),
  heroKicker: fallbackText(row.hero_kicker, DEFAULT_FOODBANK_PROFILE.heroKicker),
  heroTitle: fallbackText(row.hero_title, DEFAULT_FOODBANK_PROFILE.heroTitle),
  heroSummary: fallbackText(row.hero_summary, DEFAULT_FOODBANK_PROFILE.heroSummary),
  missionTitle: fallbackText(row.mission_title, DEFAULT_FOODBANK_PROFILE.missionTitle),
  missionBody: fallbackText(row.mission_body, DEFAULT_FOODBANK_PROFILE.missionBody),
  committeeTitle: fallbackText(row.committee_title, DEFAULT_FOODBANK_PROFILE.committeeTitle),
  committeeSummary: fallbackText(row.committee_summary, DEFAULT_FOODBANK_PROFILE.committeeSummary),
  committeeMembers: fallbackText(row.committee_members, DEFAULT_FOODBANK_PROFILE.committeeMembers),
  committeeUrl: fallbackText(row.committee_url, DEFAULT_FOODBANK_PROFILE.committeeUrl),
  supportTitle: fallbackText(row.support_title, DEFAULT_FOODBANK_PROFILE.supportTitle),
  supportIntro: fallbackText(row.support_intro, DEFAULT_FOODBANK_PROFILE.supportIntro),
  supportRoleStatus: fallbackText(
    row.support_role_status,
    DEFAULT_FOODBANK_PROFILE.supportRoleStatus,
  ),
  supportJoinDetails: fallbackText(
    row.support_join_details,
    DEFAULT_FOODBANK_PROFILE.supportJoinDetails,
  ),
  supportLocationDetails: fallbackText(
    row.support_location_details,
    DEFAULT_FOODBANK_PROFILE.supportLocationDetails,
  ),
  supportOpeningDetails: fallbackText(
    row.support_opening_details,
    DEFAULT_FOODBANK_PROFILE.supportOpeningDetails,
  ),
  helpSummary: fallbackText(row.help_summary, DEFAULT_FOODBANK_PROFILE.helpSummary),
  hoursPrimaryLabel: fallbackText(
    row.hours_primary_label,
    DEFAULT_FOODBANK_PROFILE.hoursPrimaryLabel,
  ),
  hoursPrimaryValue: fallbackText(
    row.hours_primary_value,
    DEFAULT_FOODBANK_PROFILE.hoursPrimaryValue,
  ),
  hoursSecondaryLabel: fallbackText(
    row.hours_secondary_label,
    DEFAULT_FOODBANK_PROFILE.hoursSecondaryLabel,
  ),
  hoursSecondaryValue: fallbackText(
    row.hours_secondary_value,
    DEFAULT_FOODBANK_PROFILE.hoursSecondaryValue,
  ),
  address: fallbackText(row.address, DEFAULT_FOODBANK_PROFILE.address),
  directionsUrl: fallbackText(row.directions_url, DEFAULT_FOODBANK_PROFILE.directionsUrl),
  phone: fallbackText(row.phone, DEFAULT_FOODBANK_PROFILE.phone),
  email: fallbackText(row.email, DEFAULT_FOODBANK_PROFILE.email),
  donationSummary: fallbackText(row.donation_summary, DEFAULT_FOODBANK_PROFILE.donationSummary),
  itemDonationDetails: fallbackText(
    row.item_donation_details,
    DEFAULT_FOODBANK_PROFILE.itemDonationDetails,
  ),
  charityName: fallbackText(row.charity_name, DEFAULT_FOODBANK_PROFILE.charityName),
  charityNumber: fallbackText(row.charity_number, DEFAULT_FOODBANK_PROFILE.charityNumber),
  websiteUrl: fallbackText(row.website_url, DEFAULT_FOODBANK_PROFILE.websiteUrl),
  supportUrl: fallbackText(row.support_url, DEFAULT_FOODBANK_PROFILE.supportUrl),
  donateUrl: fallbackText(row.donate_url, DEFAULT_FOODBANK_PROFILE.donateUrl),
  contactUrl: fallbackText(row.contact_url, DEFAULT_FOODBANK_PROFILE.contactUrl),
  aboutUrl: fallbackText(row.about_url, DEFAULT_FOODBANK_PROFILE.aboutUrl),
  facebookUrl: fallbackText(row.facebook_url, DEFAULT_FOODBANK_PROFILE.facebookUrl),
  isActive: row.is_active,
})

export const toFoodbankProfilePayload = (
  profile: FoodbankProfile,
): FoodbankProfilePayload => ({
  profile_key: profile.profileKey.trim() || DEFAULT_FOODBANK_PROFILE.profileKey,
  hero_image_url: profile.heroImageUrl.trim(),
  hero_kicker: profile.heroKicker.trim(),
  hero_title: profile.heroTitle.trim(),
  hero_summary: profile.heroSummary.trim(),
  mission_title: profile.missionTitle.trim(),
  mission_body: profile.missionBody.trim(),
  committee_title: profile.committeeTitle.trim(),
  committee_summary: profile.committeeSummary.trim(),
  committee_members: profile.committeeMembers.trim(),
  committee_url: profile.committeeUrl.trim(),
  support_title: profile.supportTitle.trim(),
  support_intro: profile.supportIntro.trim(),
  support_role_status: profile.supportRoleStatus.trim(),
  support_join_details: profile.supportJoinDetails.trim(),
  support_location_details: profile.supportLocationDetails.trim(),
  support_opening_details: profile.supportOpeningDetails.trim(),
  help_summary: profile.helpSummary.trim(),
  hours_primary_label: profile.hoursPrimaryLabel.trim(),
  hours_primary_value: profile.hoursPrimaryValue.trim(),
  hours_secondary_label: profile.hoursSecondaryLabel.trim(),
  hours_secondary_value: profile.hoursSecondaryValue.trim(),
  address: profile.address.trim(),
  directions_url: profile.directionsUrl.trim(),
  phone: profile.phone.trim(),
  email: profile.email.trim(),
  donation_summary: profile.donationSummary.trim(),
  item_donation_details: profile.itemDonationDetails.trim(),
  charity_name: profile.charityName.trim(),
  charity_number: profile.charityNumber.trim(),
  website_url: profile.websiteUrl.trim(),
  support_url: profile.supportUrl.trim(),
  donate_url: profile.donateUrl.trim(),
  contact_url: profile.contactUrl.trim(),
  about_url: profile.aboutUrl.trim(),
  facebook_url: profile.facebookUrl.trim(),
  is_active: profile.isActive,
})

type FoodbankProfileState = {
  status: 'loading' | 'success' | 'fallback'
  profile: FoodbankProfile
  error: string | null
}

export function useFoodbankProfile() {
  const [state, setState] = useState<FoodbankProfileState>({
    status: supabase ? 'loading' : 'fallback',
    profile: DEFAULT_FOODBANK_PROFILE,
    error: supabase ? null : 'Supabase is unavailable.',
  })

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      if (!supabase) return

      const { data, error } = await supabase
        .from('foodbank_profile')
        .select(FOODBANK_PROFILE_SELECT)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (!active) return

      if (error) {
        setState({
          status: 'fallback',
          profile: DEFAULT_FOODBANK_PROFILE,
          error: error.message,
        })
        return
      }

      const row = ((data ?? []) as unknown as FoodbankProfileRow[])[0]
      setState({
        status: row ? 'success' : 'fallback',
        profile: row ? toFoodbankProfile(row) : DEFAULT_FOODBANK_PROFILE,
        error: row ? null : 'No active Foodbank profile found.',
      })
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [])

  return state
}
