import React from 'react';
import styles from './LogisticsDetails.module.css';

// Reuse the same unfold icon from your LeadFormPopup (if desired)
import { ReactComponent as UnfoldMoreIcon } from '../../../../../assets/icons/unfoldmore.svg';

// Import the PackingDay component
import PackingDay from './PackingDay/PackingDay';

function LogisticsDetails({ lead, onLeadUpdated, isCollapsed, setIsCollapsed }) {
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div className={styles.logisticsContainer}>
      <div className={styles.logisticsHeader}>
        <span className={styles.logisticsTitle}>Logistics</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.innerContent}>

          {/* 1) PackingDay at the top */}
          <div className={styles.packingDayWrapper}>
            <PackingDay />
          </div>

          {/* 2) Our six groups of inputs, 
                 each group separated by 25px, 
                 items in each group separated by 10px. */}
          <div className={styles.extraInputsContainer}>

            {/* Group 1: Truck Size */}
            <div className={styles.row}>
              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Truck Size:</span>
                  <span className={styles.dropdownSelected}>26ft</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>
            </div>

            {/* Group 2: Number of Trucks, Number of Man, Hourly Rate */}
            <div className={styles.row}>
              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Number of Trucks:</span>
                  <span className={styles.dropdownSelected}>1</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Number of Man:</span>
                  <span className={styles.dropdownSelected}>2</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Hourly Rate:</span>
                  <span className={styles.dropdownSelected}>$180.00</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>
            </div>

            {/* Group 3: Volume, Weight, Price/Cuft, Price/lbs */}
            <div className={styles.row}>
              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Volume:</span>
                  <span className={styles.dropdownSelected}>1000 cuft</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Weight:</span>
                  <span className={styles.dropdownSelected}>7000 lbs</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Price per Cuft:</span>
                  <span className={styles.dropdownSelected}>$4.5</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Price per lbs:</span>
                  <span className={styles.dropdownSelected}>$0.74</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>
            </div>

            {/* Group 4: Travel Time */}
            <div className={styles.row}>
              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Travel Time:</span>
                  <span className={styles.dropdownSelected}>1h</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>
            </div>

            {/* Group 5: Moving minimum */}
            <div className={styles.row}>
              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Moving minimum:</span>
                  <span className={styles.dropdownSelected}>3h</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>
            </div>

            {/* Group 6: Pickup window, Drop-off window, Delivery window */}
            <div className={styles.row}>
              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Pickup window:</span>
                  <span className={styles.dropdownSelected}>03/26/2025 - 03/27/2025</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Drop-off start window:</span>
                  <span className={styles.dropdownSelected}>03/28/2025</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              <button type="button" className={styles.logisticsButton}>
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Delivery Window:</span>
                  <span className={styles.dropdownSelected}>7 days</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>
            </div>
          </div>
          {/* End of extraInputsContainer */}
        </div>
      )}
    </div>
  );
}

export default LogisticsDetails;
