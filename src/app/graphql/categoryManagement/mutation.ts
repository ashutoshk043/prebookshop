import { gql } from 'apollo-angular';

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      _id
      name
      slug
      categoryType
      imageUrl
      order
      displaySections
      isActive
      isOnlineVisible
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      _id
      name
      slug
      categoryType
      imageUrl
      order
      displaySections
      isActive
      isOnlineVisible
      updatedAt
    }
  }
`;