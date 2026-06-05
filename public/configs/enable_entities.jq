(.data.entities[]
 | select(.entity_id | IN(
     "sensor.sigen_plant_available_max_discharging_capacity",
     "sensor.sigen_plant_available_max_active_power",
     "number.sigen_plant_ess_backup_state_of_charge",
     "number.sigen_plant_ess_charge_cut_off_state_of_charge",
     "number.sigen_plant_ess_discharge_cut_off_state_of_charge",
     "number.sigen_plant_ess_max_charging_limit",
     "number.sigen_plant_ess_max_discharging_limit",
     "select.sigen_plant_remote_ems_control_mode",
     "number.sigen_plant_grid_import_limitation",
     "switch.sigen_plant_remote_ems_controlled_by_home_assistant"))
 | .disabled_by) = null
