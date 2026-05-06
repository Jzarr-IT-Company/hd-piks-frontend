import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useNavbarMegaMenuQuery } from "../../query/navbarMenuQueries.js";
import { buildNavbarMegaMenu } from "../../utils/navbarMenuConfig.js";

const fallbackMenuItems = buildNavbarMegaMenu([]);

function MegaMenuNavItem({ item }) {
  const hasSubcategories = item.subcategories.length > 0;

  return (
    <li className="nav-item dropdown hdp-mega-nav-item">
      <Link
        className="nav-link fw-semibold text-white dropdown-toggle"
        to={item.path}
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {item.label}
      </Link>

      <div className="dropdown-menu hdp-mega-menu">
        <div className="hdp-mega-menu__content">
          <div className="hdp-mega-menu__intro">
            <img src={item.image} alt={`${item.label} preview`} className="hdp-mega-menu__image" />
            <div>
              <p className="hdp-mega-menu__eyebrow">Browse {item.label}</p>
              <h3 className="hdp-mega-menu__title">{item.label}</h3>
              <p className="hdp-mega-menu__description">{item.description}</p>
            </div>
          </div>

          <div className="hdp-mega-menu__links">
            <div className="hdp-mega-menu__links-header">
              <span>Latest sub categories</span>
              <Link className="hdp-mega-menu__view-all" to={item.path}>
                View more
                <ChevronRight size={15} strokeWidth={2.4} />
              </Link>
            </div>

            {hasSubcategories ? (
              <div className="hdp-mega-menu__grid">
                {item.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    className="hdp-mega-menu__link"
                    to={subcategory.path}
                  >
                    <span>{subcategory.label}</span>
                    <ChevronRight size={14} strokeWidth={2.4} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="hdp-mega-menu__empty">
                New sub categories will appear here as soon as they are added.
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function SidebarCompo() {
  const { menuItems } = useNavbarMegaMenuQuery();
  const items = menuItems?.length ? menuItems : fallbackMenuItems;

  return (
    <ul className="navbar-nav me-auto mb-2 mb-lg-0 hdp-navbar-menu">
      <li className="nav-item">
        <Link className="nav-link fw-semibold text-white active" to="/">
          Home
        </Link>
      </li>

      {items.map((item) => (
        <MegaMenuNavItem key={item.slug} item={item} />
      ))}

      <li className="nav-item">
        <a
          className="nav-link fw-semibold text-white active"
          href="https://www.elvify.com/blog/"
          target="_self"
          rel="noopener noreferrer"
        >
          Blog
        </a>
      </li>
    </ul>
  );
}

export default SidebarCompo;
