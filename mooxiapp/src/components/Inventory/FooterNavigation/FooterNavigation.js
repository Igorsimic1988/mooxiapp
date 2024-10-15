import React from 'react';
import styles from './FooterNavigation.module.css';

import { ReactComponent as CreateQuote } from '../../../assets/icons/createquoteicon.svg';
import { ReactComponent as MyInventory } from '../../../assets/icons/myinventory.svg';
import { ReactComponent as SpecialH } from '../../../assets/icons/specialh.svg';
import { ReactComponent as Delete } from '../../../assets/icons/specialh.svg';

function FooterNavigation() {
    return (
<footer>
          <div>
            <div>
              <CreateQuote />
            </div>
            <p>Create Quote</p>
          </div>
          <div>
            <div>
              <MyInventory />
            </div>
            <p>My Inventory</p>
          </div>
          <div>
            <div>
              <SpecialH />
            </div>
            <p>Special Handling</p>
          </div>
          <div>
            <div>
              <Delete />
            </div>
            <p>Delete</p>
          </div>
        </footer>
        );
    }

    export default FooterNavigation;