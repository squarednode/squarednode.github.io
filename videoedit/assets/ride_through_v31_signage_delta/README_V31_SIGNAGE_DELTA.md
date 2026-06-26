# Ride Through V31 Signage Delta

This delta adds signage category assets only. No engine changes are included.

## Install

Copy `assets/signage/` into your project and replace `assets/catalog/asset_catalog.json` with the included updated catalog.

## Added signage assets

- `signage_ride_entrance` - Ride Entrance Sign
- `signage_exit` - Exit Sign
- `signage_wait_time` - Wait Time Sign
- `signage_height_requirement` - Height Requirement Sign
- `signage_safety_warning` - Safety Warning Sign
- `signage_express_lane` - Express Lane Sign
- `signage_standby_queue` - Standby Queue Sign
- `signage_accessibility` - Accessibility Sign
- `signage_restrooms` - Restrooms Sign
- `signage_food_drink` - Food And Drink Sign
- `signage_photo_spot` - Photo Spot Sign
- `signage_guest_services` - Guest Services Sign
- `signage_emergency_exit` - Emergency Exit Sign
- `signage_area_map` - Area Map Board
- `signage_dinosaur_paddock` - Dinosaur Paddock Sign
- `signage_pirate_cove` - Pirate Cove Sign
- `signage_space_hangar` - Space Hangar Sign
- `signage_wizard_school` - Wizard School Sign
- `signage_haunted_estate` - Haunted Estate Sign
- `signage_racing_garage` - Racing Garage Sign
- `signage_alien_forest` - Alien Forest Sign
- `signage_world_festival` - World Festival Sign
- `signage_alpine_trail` - Alpine Trail Sign
- `signage_neon_grid` - Neon Grid Sign
- `signage_hero_city` - Hero City Sign
- `signage_mine_town` - Mine Town Sign
- `signage_mummy_tomb` - Tomb Entrance Sign
- `signage_temple_warning` - Temple Warning Sign
- `signage_lab_hazard` - Lab Hazard Sign

## Story override example

```json
{
  "id": "entranceSign1",
  "asset": "signage_ride_entrance",
  "position": [420, 330, 2],
  "scale": 0.7,
  "text": "START",
  "panelColor": "#f4d35e",
  "accentColor": "#2f6eea"
}
```
