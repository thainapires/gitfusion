### Git Fusion 🐱🦊

![screenshot-gitfusion1](https://github.com/user-attachments/assets/6078479b-2cd5-4294-87cb-c0e6a7e30dbf)

### 🚀  Try out Git Fusion: [https://gitfusion.vercel.app](https://gitfusion.vercel.app)

Git Fusion is a tool that seamlessly combines contribution data from GitHub and GitLab into a unified, interactive graph. Whether you're an open-source enthusiast, a professional developer, or managing multiple repositories across platforms, Git Fusion provides a clear, comprehensive view of your coding activity.

> Stay on top of your development journey with Git Fusion—because your work deserves to be seen, no matter where you code.

#### Key Features

- Unified Contribution Graph: Merge and visualize your contributions from GitHub and GitLab in one place.
- Cross-Platform Insights: Track your commits numbers from both platforms.
- Developer-Focused: Built for developers who want a centralized view of their contributions without switching between platforms.

#### Possible future features:

### Possible Future Features

- **Customizable Views**: Filter contributions by repository, time range, or platform to better analyze your work.
- **User Profiles**: Integrate with GitHub/GitLab user profiles to display additional details about contributions.
- **Automated Reports**: Generate daily, weekly, or monthly reports summarizing your contributions.
- **Authentication**: Add a user login/register so there's no need to always type the profile usernames to request again.

#### Setup

1. Installation
```sh
npm i
```

2. Copy the contents of ```.env.local.example``` into a new file called ```.env.local``` and add your github access token and change port of api if needed

2. Usage
```sh
npm run dev
```

### Credits

Git Fusion is inspired by the Contra project, which you can find [here](https://github.com/ahmetkorkmaz3/contra). Contra was built with Vue.js, but I decided to reimagine it using Next.js. Also, I used Typescript to add more code clarity and maintainability. In addition to the framework shift, I made enhancements to the UI and adapted various elements for React, including integrating a new library for calendar contributions. There’s more to come as I continue to enhance this project!
