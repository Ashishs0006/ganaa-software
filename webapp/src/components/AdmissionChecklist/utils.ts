export const getDocumentNumber = (documentType: string) => {
    switch (documentType) {
      case "Aadhar Card":
        return 12;
      case "Driving License":
        return 15;
      case "Passport":
        return 8;
      case "VoterID":
        return 10;
      default:
        return 20;
    }
  };