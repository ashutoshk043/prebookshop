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


