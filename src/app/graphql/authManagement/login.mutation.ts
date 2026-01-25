import { gql } from "apollo-angular";

export const LOGIN_RESTAURENT_USER = gql`
  mutation loginRestraurent($loginData: RestraurentLoginDTO!) {
    loginRestraurent(loginData: $loginData) {
      accessToken 
      refreshToken
      userProfile {
        name
        email
        phone
        state
        district
        block
        village
        roleId
        profile
        status
      }
    }
  }
`;


export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;