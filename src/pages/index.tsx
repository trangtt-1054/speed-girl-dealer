import { GetServerSideProps } from "next";
import { getMakes, Make } from "../database/getMakes";
import { Formik, Form, Field } from "formik";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import { useRouter } from "next/dist/client/router";

export interface HomeProps {
  makes: Make[];
}

const useStyles = makeStyles(theme => ({
  paper: {
    margin: "auto",
    maxwidth: 500,
    padding: theme.spacing(3)
  }
}));

export default function Home({ makes }: HomeProps) {
  const classes = useStyles();
  //return <div>{JSON.stringify(makes, null, 4)}</div>;
  //There are 2 things we have to pass to Formik, they are initialValues and omSubmit fn

  const { query } = useRouter(); //Pass value từ router vào intialValues thì khi mà edit value trên route và refresh thì value đó sẽ tự động fill vào form. Now our make needs to know about Formik => add <Field> component from Formik in place of Material-ui 's <Select>. Nhớ thêm name="make" vào field thì sẽ connect this name with this field (data binding, one directional flow)
  const initialValues = {
    make: query.make || "all",
    model: query.model || "all",
    minPrice: query.minPrice || "all",
    maxPrice: query.minPrice || "all"
  };

  const prices = [500, 1000, 5000, 10000, 15000, 20000, 25000];

  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {/* values is automatically available in formik */}
      {({ values }) => (
        <Form>
          {/* elevation={5} gives us 3d effect */}
          <Paper elevation={5} className={classes.paper}>
            {/* spacing={3} means 8px * 3 = 24px */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl variant='outlined' fullWidth>
                  <InputLabel id='search-make'>Make</InputLabel>
                  <Field
                    name='make'
                    as={Select}
                    labelId='search-make'
                    label='Make'
                  >
                    <MenuItem value='all'>
                      <em>All Makes</em>
                    </MenuItem>
                    {makes.map(make => (
                      <MenuItem value={make.make}>
                        {`${make.make} (${make.count})`}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                Model
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant='outlined' fullWidth>
                  <InputLabel id='search-min-price'>Min Price</InputLabel>
                  <Field
                    name='minPrice'
                    as={Select}
                    labelId='search-min-price'
                    label='Min Price'
                  >
                    <MenuItem value='all'>
                      <em>No Minimum</em>
                    </MenuItem>
                    {prices.map(price => (
                      <MenuItem value={price}>{price}</MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant='outlined' fullWidth>
                  <InputLabel id='search-max-price'>Max Price</InputLabel>
                  <Field
                    name='maxPrice'
                    as={Select}
                    labelId='search-max-price'
                    label='Max Price'
                  >
                    <MenuItem value='all'>
                      <em>No Maximum</em>
                    </MenuItem>
                    {prices.map(price => (
                      <MenuItem value={price}>{price}</MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Form>
      )}
    </Formik>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const makes = await getMakes();
  return { props: { makes } };
};

/*
makes có dạng
[ { "make": "Audi", "count": 1 }, { "make": "BMW", "count": 3 }, { "make": "Ford", "count": 2 }, { "make": "Mazda", "count": 1 }, { "make": "Merces-Benz", "count": 2 }, { "make": "Peugeot", "count": 1 }, { "make": "Renault", "count": 3 }, { "make": "Seat", "count": 1 }, { "make": "Smart", "count": 4 }, { "make": "Volkswagen", "count": 3 } ]
 */
