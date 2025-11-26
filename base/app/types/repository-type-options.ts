import { RepositoryType } from "./repository-type";

const repositoryTypeOptions = [
  { value: RepositoryType.github, label: "GitHub", icon: "mdi:github" },
  {
    value: RepositoryType.singleFile,
    label: "Static File",
    icon: "mdi:file-code",
  },
];

export default repositoryTypeOptions;
