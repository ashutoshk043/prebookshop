import { gql } from 'apollo-angular';

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories {
      _id
      name
      slug
      imageUrl
      order
      priority
      categoryType
      displaySections
      badges
      isActive
      isOnlineVisible
    }
  }
`;

export const GET_ALL_CATEGORIES_FORM = gql`
  query IncludedCategoriesPaginated($page: Int!, $limit: Int!, $search: String) {
    includedCategoriesPaginated(page: $page, limit: $limit, search: $search) {
      data {
        _id
      name
      }
      total
      totalPages
      currentPage
      limit
      hasNextPage
      hasPrevPage
    }
  }
`;

export const GET_INCLUDED_CATEGORIES_PAGINATED = gql`
  query IncludedCategoriesPaginated($page: Int!, $limit: Int!, $search: String) {
    includedCategoriesPaginated(page: $page, limit: $limit, search: $search) {
      data {
        _id
      name
      slug
      imageUrl
      order
      priority
      categoryType
      displaySections
      badges
      isActive
      isOnlineVisible
      }
      total
      totalPages
      currentPage
      limit
      hasNextPage
      hasPrevPage
    }
  }
`;

