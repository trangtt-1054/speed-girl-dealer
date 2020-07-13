import { GetStaticProps } from "next";
import { openDB } from "../openDB";
import { FaqModel } from "../../api/Faq";
import Accordion from "@material-ui/core/Accordion";
import {
  AccordionSummary,
  Typography,
  AccordionDetails
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

interface FaqProps {
  faqs: FaqModel[];
}

export default function Faq({ faqs }: FaqProps) {
  return (
    <div>
      {faqs.map(faq => (
        <Accordion key={faq.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel1bh-content'
            id='panel1bh-header'
          >
            <Typography>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

//render this page at build time, this is the page we never change at run time
export const getStaticProps: GetStaticProps = async () => {
  const db = await openDB();
  const faqs = await db.all("SELECT * FROM FAQ ORDER BY createDate DESC");

  return { props: { faqs } };
};
