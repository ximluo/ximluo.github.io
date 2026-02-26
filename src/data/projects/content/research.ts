import type { Project } from "../types"

const researchProjects: Project[] = [
  // machine learning
  {
    id: "statistical-learning-returns",
    name: "Machine Learning in Asset Pricing",
    image: "/images/wdrp.png",
    description:
      "This Wharton Directed Reading Program project investigates whether asset returns can be predicted using modern statistical learning methods. The research evaluates the efficiency of financial markets by applying both classical econometrics and advanced machine learning models to historical stock data.",
    languages: ["Python", "R"],
    categories: ["software", "finance", "machine learning", "research"],
    sections: [
      {
        text: "Wharton Directed Reading Program, April 24, 2025: MACHINE LEARNING IN ASSET PRICING. Exploring predictability in stock returns. Lead student: Ximing Luo (CS (DMD) and Economics ’27). Mentor: Yiwen Lu (Finance PhD, 2nd Year).",
      },
      {
        text: "Introduction: Challenge. Despite the efficient market hypothesis asserting that prices reflect all available information, subtle anomalies persist. Motivation. Asset prices are dynamic predictions built on evolving data, and machine learning can uncover weak nonlinear signals without strict functional assumptions.",
      },
      {
        text: "Background and Methodology: Reviewed efficient market hypothesis in weak, semi strong, and strong forms. Revisited the fundamental asset pricing equation and CAPM as a benchmark. Designed a hybrid workflow exploring econometric models such as linear regression, ARIMA, and factor models with modern ML such as penalized regression, tree based methods, feed forward and recurrent neural networks, and CNNs for chart image feature extraction.",
      },
      {
        text: "Data, Analysis and Empirical Findings: Used historical prices, technical and fundamental signals, and alternative sources such as news sentiment and OHLC chart images. Extracted features via PCA, NLP topic models, and CNN embeddings. Trained and validated with pseudo out of sample cross validation. Modern ML models achieved higher out of sample R squared and improved trading metrics, revealing double descent behavior in overparameterized regimes.",
      },
      {
        text: "Implications and Future Directions: Modern ML improves return predictability and informs adaptive long short strategies, risk forecasts, and real time integration of alternative data. Future work will deepen sentiment and image based features and develop hybrid frameworks that fuse economic theory with data driven predictions to better capture evolving market dynamics.",
      },
    ],
  },

  // HCI research
  {
    id: "hci-research-jhu",
    name: "Human AI Interaction Projects at JHU",
    image: "/images/hci.png",
    description:
      "Conducted research in the Intuitive Computing Laboratory under Dr Chien Ming Huang. Contributed to projects on two areas of human AI interaction: end to end co creation of visual stories with generative models, and apology strategies to mitigate errors in voice assistants.",
    languages: ["Python", "React.js"],
    categories: ["software", "HCI", "Generative AI", "User Studies"],
    sections: [
      {
        text: "Contributed to two projects in the Intuitive Computing Lab at Johns Hopkins University, collaborating with PhD students Victor Nikhil Antony and Amama Mahmood. One project introduces an integrated authoring system for visual story creation using LLMs and multimodal generation. The other studies how apology tone and blame assignment affect user perceptions of voice assistants after recognition errors.",
      },
      {
        text: "ID.8: Co Creating Visual Stories with Generative AI. Built an open source React system for a multi stage authoring workflow: collaborative script generation, automated scene parsing into storyboards, and asset creation with generative models. A human in control design keeps users in charge while AI accelerates iteration. User studies found strong usability and enjoyment and produced design guidance for prompt templates, iterative co creation, and consistent AI identity management. For details, see [ID.8: Co Creating Visual Stories with Generative AI](https://doi.org/10.1145/3672277).",
      },
      {
        text: "Owning Mistakes Sincerely: Strategies for Mitigating AI Errors. Ran an online study with a voice based shopping assistant that varied apology style and blame attribution after homonym recognition errors. A serious apology that accepts blame improved recovery satisfaction, perceived intelligence, and likeability, while blaming others could be worse than no apology. For details, see [Owning Mistakes Sincerely: Strategies for Mitigating AI Errors](https://doi.org/10.1145/3491102.3517565).",
      },
    ],
  },

  // AR research
  {
    id: "ar-mri-point-cloud",
    name: "AR MRI Point Cloud Visualization",
    image: "/images/ar-mri.png",
    description:
      "Integrated pipeline automating conversion of patient brain MRIs into high quality 3D point cloud models for augmented reality. Enables collaborative visualization and annotation on Microsoft HoloLens head mounted displays.",
    languages: ["Python", "C#"],
    categories: ["software", "Augmented Reality", "Medical Imaging", "Web Development"],
    sections: [
      {
        text: "This project streamlines a manual workflow of medical scan segmentation, mesh cleanup, and file conversion into a single web application. Physicians upload DICOM MRI sequences, automatically generate refined 3D point cloud models, and view or annotate them in real time on multiple AR headsets.",
      },
      {
        text: "Pipeline steps include intensity threshold segmentation on 2D slices, outlier removal that drops points beyond 2.5 standard deviations from each anatomical centroid, and streaming the processed point cloud through a REST API into a Unity based Microsoft HoloLens app for immersive visualization, annotation, and manipulation.",
      },
      {
        text: "Generated two complete point cloud models from brain MRI datasets and rendered them in AR, highlighting challenges with complex neuroanatomy. Ongoing work improves segmentation robustness, adds color coded segment views, and expands support for multi contrast MRI.",
      },
      {
        text: "Worked with Dr. Chamith Rajapakse in Radiology and Orthopedics to optimize machine learning based MRI segmentation workflows in Python and C++ for 3D point cloud generation, and integrated real time AR visualization and annotation on Microsoft HoloLens 2 using Unity and C# for clinical diagnostics.",
      },
    ],
  },
]

export default researchProjects
